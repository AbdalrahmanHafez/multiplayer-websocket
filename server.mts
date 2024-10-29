import { WebSocketServer, WebSocket } from 'ws';
import * as common from './common.mjs'
import { applyCollidBallPlayer, checkWin, updateBallState, updatePlayerState, log_debug, log_error, init_playerLeft, init_playerRight, GameState, Ball, init_ball, Player } from './common.mjs';

const TICKS_TO_SYNC = 20
const SERVER_FPS = 60;
let idCounter = 0;

interface PlayerOnServer extends Player {
    ws: WebSocket
    remoteaddress: string
}

const wss = new WebSocketServer({
    port: common.SERVER_PORT,
})

const getPlayerFromWs = (ws: WebSocket) => {
    if (!p1 || !p2) return null
    if (p1.ws === ws) return p1
    if (p2.ws === ws) return p2
    return null
}

const getOtherPlayer = (player: PlayerOnServer) => {
    if (!p1 || !p2) return null
    if (player === p2) return p1
    if (player === p1) return p2
    return null
}


wss.on("connection", (ws, req) => {
    ws.binaryType = 'arraybuffer';

    const remoteAddress = req.socket.remoteAddress;
    console.log("[INFO] connection from ", remoteAddress)

    if (p1 && p2 || remoteAddress === undefined) {
        console.log("[INFO] closed connection")
        ws.close()
        return
    }

    if (p1 === null) {
        p1 = { ...init_playerLeft, ws: ws, remoteaddress: remoteAddress }
    } else {
        p2 = { ...init_playerRight, ws: ws, remoteaddress: remoteAddress }
    }

    if (p1 && p2) {
        gameState = GameState.Running;
        ([p1, p2]).forEach((player, idx) => {
            const msgBufferView = new DataView(new ArrayBuffer(common.MessageNewGame.size))
            common.MessageNewGame.kind.write(msgBufferView, common.MessageKind.NewGame)
            common.MessageNewGame.playerSlot.write(msgBufferView, idx)
            player.ws.send(msgBufferView)
        });
    }

    ws.on("message", (data) => {
        if (!(data instanceof ArrayBuffer)) {
            ws.close();
            return;
        }

        const view = new DataView(data)

        if (common.MessageMove.verify(view)) {
            const player = getPlayerFromWs(ws)
            if (player === null) return log_error("Invalid player")

            player.moving = common.MessageMove.moving.read(view);

            const otherPlayer = getOtherPlayer(player)
            otherPlayer?.ws.send(view)

        } else {
            console.log("[ERROR] invliad message, closing")
            ws.close()
        }
    })

    ws.on("close", () => {
        console.log("[INFO] socket close")
        if (p1 != null) {
            p1.ws.close()
            p1 = null
        }
        if (p2 != null) {
            p2.ws.close()
            p2 = null
        }
    })

});

function sendSyncMessages() {
    if (p1 === null || p2 === null) return

    ([p1, p2]).forEach(player => {
        const view = new DataView(new ArrayBuffer(common.MessageResync.size))
        common.MessageResync.kind.write(view, common.MessageKind.Resync)
        common.MessageResync.gamestate.write(view, gameState)

        common.MessageResync.ball.x.write(view, ball.x)
        common.MessageResync.ball.y.write(view, ball.y)
        common.MessageResync.ball.dy.write(view, ball.dy)
        common.MessageResync.ball.dx.write(view, ball.dx)

        common.MessageResync.p1.moving.write(view, p1!.moving)
        common.MessageResync.p1.score.write(view, p1!.score)
        common.MessageResync.p1.y.write(view, p1!.box.y)

        common.MessageResync.p2.moving.write(view, p2!.moving)
        common.MessageResync.p2.score.write(view, p2!.score)
        common.MessageResync.p2.y.write(view, p2!.box.y)

        player.ws.send(view)
    });

}

let gameState: GameState = GameState.WaitingPlayer;
let p1: PlayerOnServer | null = null;
let p2: PlayerOnServer | null = null
const ball: Ball = { ...init_ball }

let ticksToSync = TICKS_TO_SYNC;
let previousTimestamp = performance.now();
const loop = () => {
    const timestamp = performance.now();
    const deltaTime = (timestamp - previousTimestamp) / 1000
    previousTimestamp = timestamp
    ticksToSync -= 1
    if (ticksToSync <= 0) {
        sendSyncMessages()
        ticksToSync = TICKS_TO_SYNC
        // log_debug(ball.x)
    }

    if (p1 && p2 && gameState === GameState.Running) {
        checkWin(ball, p1, p2)

        updatePlayerState(p1, deltaTime);
        updatePlayerState(p2, deltaTime);

        updateBallState(ball, deltaTime);

        applyCollidBallPlayer(ball, p1);
        applyCollidBallPlayer(ball, p2);
    }

    const tickTime = performance.now() - timestamp
    setTimeout(loop, Math.max(0, 1000 / SERVER_FPS - tickTime));
}


loop()

