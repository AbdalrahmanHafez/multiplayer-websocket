import * as common from './common.mjs'
import { Ball, Player, BBox, Point, SCREEN_PADDING, PLAYER_HEIGHT, PLAYER_SPEED, PLAYER_WIDTH, BALL_RADIUS, BALL_SPEED, GameState, init_ball, checkWin, updateBallState, updatePlayerState, applyCollidBallPlayer } from './common.mjs';

const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
if (canvas === null) throw new Error("No element with id `canvas`")
const ctx = canvas.getContext('2d');
if (ctx === null) throw new Error("No 2D context")

let gameState: GameState = GameState.WaitingPlayer
const p1: Player = {
    box: {
        x: SCREEN_PADDING,
        y: canvas.height / 2 - PLAYER_HEIGHT / 2,
        w: PLAYER_WIDTH,
        h: PLAYER_HEIGHT,
    },
    moving: 0,
    score: 0,
}
const p2: Player = {
    box: {
        x: canvas.width - (SCREEN_PADDING + PLAYER_WIDTH),
        y: canvas.height / 2 - PLAYER_HEIGHT / 2,
        w: PLAYER_WIDTH,
        h: PLAYER_HEIGHT,
    },
    moving: 0,
    score: 0,
}
const ball: Ball = { ...init_ball }

let previousTimestamp = 0;
var loop = function (time: number) {
    if (previousTimestamp === 0)
        previousTimestamp = time - (1000 / 60)

    const deltaTime = (time - previousTimestamp) / 1000
    previousTimestamp = time

    // Clear
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Players
    ctx.fillStyle = 'white';
    ctx.fillRect(p1.box.x, p1.box.y, p1.box.w, p1.box.h);
    ctx.fillRect(p2.box.x, p2.box.y, p2.box.w, p2.box.h);

    if (gameState === GameState.Running as GameState) {
        // Ball
        ctx.fillStyle = "#c82124";
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();


        // Dashed line
        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.setLineDash([10, 15]);
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();

        // Score
        ctx.font = "48px bold";
        ctx.fillStyle = 'white';
        ctx.fillText('' + p1.score, canvas.width / 2 - canvas.width / 4, canvas.height / 5);
        ctx.fillText('' + p2.score, canvas.width / 2 + canvas.width / 4, canvas.height / 5);

        checkWin(ball, p1, p2)

        updatePlayerState(p1, deltaTime);
        updatePlayerState(p2, deltaTime);

        updateBallState(ball, deltaTime);

        applyCollidBallPlayer(ball, p1);
        applyCollidBallPlayer(ball, p2);
    }
    else if (gameState === GameState.WaitingPlayer as GameState) {
        const label = "Waiting other player";
        const size = ctx.measureText(label);
        ctx.font = "48px bold";
        ctx.fillStyle = 'white';
        ctx.fillText(label, ctx.canvas.width / 2 - size.width / 2, ctx.canvas.height / 2);
    } else {
        console.error("Unreachable");
    }

    requestAnimationFrame(loop);
};


requestAnimationFrame(loop);
window.addEventListener("keydown", (e) => {
    if (e.repeat) return;
    if (e.key === "w")
        p1.moving = -1
    if (e.key === "s")
        p1.moving = 1

    if (e.key === "ArrowUp")
        p2.moving = -1
    if (e.key === "ArrowDown")
        p2.moving = 1

});

window.addEventListener("keyup", (e) => {
    if (e.repeat) return;
    if (e.key === "w" || e.key == "s")
        p1.moving = 0

    if (e.key === "ArrowUp" || e.key == "ArrowDown")
        p2.moving = 0
});
