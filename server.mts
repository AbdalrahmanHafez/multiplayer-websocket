import { WebSocketServer, WebSocket } from 'ws';
import * as common from './common.mjs'
import { init_playerLeft, init_playerRight, GameState, Ball, init_ball, Player } from './common.mjs';

const SERVER_FPS = 60;
let idCounter = 0;

interface PlayerOnServer extends Player {
    ws: WebSocket
    remoteaddress: string
}

const wss = new WebSocketServer({
    port: common.SERVER_PORT,
})


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
        gameState = GameState.Running;

        ([p1, p2]).forEach(player => {
            const msgBufferView = new DataView(new ArrayBuffer(common.MessageNewGame.size))
            common.MessageNewGame.kind.write(msgBufferView, common.MessageKind.NewGame)
            player.ws.send(msgBufferView)
        });
    }


    ws.on("message", (event) => { })

    ws.on("close", () => { })

});

let gameState: GameState = GameState.WaitingPlayer;
let p1: PlayerOnServer | null = null;
let p2: PlayerOnServer | null = null
const ball: Ball = { ...init_ball }

let previousTimestamp = performance.now();
const loop = () => {
    setTimeout(loop, 1000 / SERVER_FPS);
    const time = performance.now();
    const deltaTime = (time - previousTimestamp) / 1000
    previousTimestamp = time

}


loop()