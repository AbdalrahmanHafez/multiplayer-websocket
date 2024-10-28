
export const SERVER_PORT = 8085;

// Client
export const CANVAS_WIDTH = 1280
export const CANVAS_HEIGHT = 720

export const PLAYER_SPEED = 900;
export const PLAYER_HEIGHT = 130;
export const PLAYER_WIDTH = 20;

export const SCREEN_PADDING = 50;

export const BALL_RADIUS = 9;
export const BALL_SPEED = 400;

export interface Point {
    x:number,
    y:number,
}

export interface BBox {
    x: number,
    y: number,
    w: number,
    h: number,
}

export interface Player {
    box: BBox,
    moving: number, // 0 not moving, 1 down, -1 up
    score: number,
}

export interface Ball {
    x: number,
    y: number,
    dx: number,
    dy: number,
}

export enum GameState {
    WaitingPlayer = 0,
    Running
}

export const init_ball = {
    x: CANVAS_WIDTH/2,
    y: CANVAS_HEIGHT/2,
    dx: 1,
    dy: 1,
}

export const updatePlayerState = (player: Player, deltaTime: number) => {
    if(player.moving != 0) {
        const newY = player.box.y + player.moving * PLAYER_SPEED * deltaTime;
        if(newY < CANVAS_HEIGHT - PLAYER_HEIGHT && newY > 0)
            player.box.y = newY
    }
}

export const updateBallState = (ball: Ball, deltaTime: number) => {
    const newX = ball.x + ball.dx * BALL_SPEED * deltaTime;
    ball.x = newX
    // ball.x = (newX >= CANVAS_WIDTH - BALL_RADIUS || newX  <= BALL_RADIUS) 
    //     ? ((ball.dx *= -1), ball.x + ball.dx * BALL_SPEED * deltaTime) 
    //     : newX;

    const newY = ball.y + ball.dy * BALL_SPEED * deltaTime;
    ball.y = (newY >= CANVAS_HEIGHT - BALL_RADIUS || newY <= BALL_RADIUS) 
        ? ((ball.dy *= -1), ball.y + ball.dy * BALL_SPEED * deltaTime) 
        : newY;

}

export const checkWin = (ball:Ball, p1:Player, p2:Player) =>{
    if (ball.x > CANVAS_WIDTH){
        p1.score += 1
        Object.assign(ball, init_ball)
    }
    if (ball.x < 0){
        p2.score += 1
        Object.assign(ball, init_ball)
    }
}

export const pointInRect = (p : Point, rect: BBox) => {
    if(p.x >= rect.x && p.x <= rect.x + rect.w &&
        p.y >= rect.y && p.y <= rect.y + rect.h )
            return true
        
    return false
}

export const applyCollidBallPlayer = (ball : Ball, player : Player) => {
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

export function assert(condition: boolean, message?: string) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}