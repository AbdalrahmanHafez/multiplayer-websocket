

const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
if (canvas === null) throw new Error("No element with id `canvas`")
const ctx = canvas.getContext('2d');
if (ctx === null) throw new Error("No 2D context")

const PLAYER_SPEED = 900;
const PLAYER_HEIGHT = 130;
const PLAYER_WIDTH = 20;

const SCREEN_PADDING = 50;

const BALL_RADIUS = 9;
const BALL_SPEED = 400;

interface Point {
    x:number,
    y:number,
}

interface BBox {
    x: number,
    y: number,
    w: number,
    h: number,
}

interface Player {
    box: BBox,
    moving: number, // 0 not moving, 1 down, -1 up
}

interface Ball {
    x: number,
    y: number,
    dx: number,
    dy: number,
}


const p1 : Player = {
    box: {
        x: SCREEN_PADDING,
        y: canvas.height / 2 - PLAYER_HEIGHT / 2,
        w: PLAYER_WIDTH,
        h: PLAYER_HEIGHT,
    },
    moving: 0,
}

const p2 : Player = {
    box: {
        x: canvas.width - (SCREEN_PADDING + PLAYER_WIDTH),
        y: canvas.height / 2 - PLAYER_HEIGHT / 2,
        w: PLAYER_WIDTH,
        h: PLAYER_HEIGHT,
    },
    moving: 0,
}

const init_ball = {
    x: canvas.width / 2,
    y: canvas.height/ 2,
    dx: 1,
    dy: 1,
}

const ball : Ball = {
    ...init_ball
}

let score_p1 = 0
let score_p2 = 0


let previousTimestamp = 0;
var loop = function(time: number){
    if(previousTimestamp === 0)
        previousTimestamp = time - (1000/60)

    const deltaTime = (time - previousTimestamp) / 1000
    previousTimestamp = time

    // Clear
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Players
    ctx.fillStyle = 'white';
    ctx.fillRect(p1.box.x, p1.box.y, p1.box.w, p1.box.h);
    ctx.fillRect(p2.box.x, p2.box.y, p2.box.w, p2.box.h);
    
    // Ball
    ctx.fillStyle = "#c82124";
    ctx.beginPath();
    ctx.arc(ball.x,ball.y, BALL_RADIUS, 0,Math.PI*2);
    ctx.closePath();
    ctx.fill();

    // Dashed line
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.setLineDash([10, 15]);
    ctx.moveTo(canvas.width /2, 0);
    ctx.lineTo(canvas.width /2, canvas.height);
    ctx.stroke();

    // Score
    ctx.font = "48px bold";
    ctx.fillStyle = 'white';
    ctx.fillText(''+score_p1, canvas.width/2 - canvas.width/4, canvas.height/5);
    ctx.fillText(''+score_p2, canvas.width/2 + canvas.width/4, canvas.height/5);


    updatePlayerState(p1, deltaTime);
    updatePlayerState(p2, deltaTime);

    updateBallState(ball, deltaTime);
    
    applyCollidBallPlayer(ball, p1);
    applyCollidBallPlayer(ball, p2);

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


const updatePlayerState = (player: Player, deltaTime: number) => {
    if(player.moving != 0) {
        const newY = player.box.y + player.moving * PLAYER_SPEED * deltaTime;
        if(newY < canvas.height - PLAYER_HEIGHT && newY > 0)
            player.box.y = newY
    }
}

const updateBallState = (ball: Ball, deltaTime: number) => {
    const newX = ball.x + ball.dx * BALL_SPEED * deltaTime;
    ball.x = newX
    // ball.x = (newX >= canvas.width - BALL_RADIUS || newX  <= BALL_RADIUS) 
    //     ? ((ball.dx *= -1), ball.x + ball.dx * BALL_SPEED * deltaTime) 
    //     : newX;

    const newY = ball.y + ball.dy * BALL_SPEED * deltaTime;
    ball.y = (newY >= canvas.height - BALL_RADIUS || newY <= BALL_RADIUS) 
        ? ((ball.dy *= -1), ball.y + ball.dy * BALL_SPEED * deltaTime) 
        : newY;


    if (ball.x > canvas.width){
        score_p1 += 1
        Object.assign(ball, init_ball)
    }
    if (ball.x < 0){
        score_p2 += 1
        Object.assign(ball, init_ball)
    }

}

const pointInRect = (p : Point, rect: BBox) => {
    if(p.x >= rect.x && p.x <= rect.x + rect.w &&
        p.y >= rect.y && p.y <= rect.y + rect.h )
            return true
        
    return false
}

const applyCollidBallPlayer = (ball : Ball, player : Player) => {
    assert(BALL_RADIUS*2 < PLAYER_HEIGHT, "ball height must be less than player height")
    assert(BALL_RADIUS*2 < PLAYER_WIDTH, "ball width must be less than player width")

    const bt = {x: ball.x, y: ball.y - BALL_RADIUS}
    const bb = {x: ball.x, y: ball.y + BALL_RADIUS}
    const bl = {x: ball.x - BALL_RADIUS, y: ball.y}
    const br = {x: ball.x + BALL_RADIUS, y: ball.y}

    if (pointInRect(bt, player.box) || pointInRect(bb, player.box)) 
      ball.dy *= -1
    

    if (pointInRect(br, player.box) || pointInRect(bl, player.box)) 
      ball.dx *= -1

}

function assert(condition: boolean, message?: string) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}