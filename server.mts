import {WebSocketServer, WebSocket} from 'ws';
import * as common from './common.mjs'
import { GameState, Ball, init_ball, Player} from './common.mjs';

const SERVER_FPS = 60;
let idCounter = 0;

const wss = new WebSocketServer({
    port: common.SERVER_PORT,
})


wss.on("connection", (ws, req) => {
    ws.binaryType = 'arraybuffer';

    const remoteAddress = req.socket.remoteAddress;
    console.log("[INFO] connection from ", remoteAddress)

    ws.on("message", (event) => {})

    ws.on("close", () => {})

});

const gameState : GameState = GameState.WaitingPlayer;
const p1 : Player | null = null
const p2 : Player | null = null
const ball: Ball = {...init_ball}

let previousTimestamp = performance.now();
const loop = () =>{
    setTimeout(loop, 1000 / SERVER_FPS);
    const time = performance.now();
    const deltaTime = (time - previousTimestamp) / 1000
    previousTimestamp = time

}


loop()