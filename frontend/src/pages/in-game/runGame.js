/**
 * 게임 실행 함수
 * @param canvas {HTMLElement} 게임이 실행될 캔버스
 * @param bar1 {object} 바의 x, y, width, height, speed
 * @param bar2 {object} 바의 x, y, width, height, speed
 * @param ball {object} 공의 x, y, radius, direction, speed
 * @param drawFunction {function} 캔버스를 그리는 함수
 */
export const runGame = (canvas, bar1, bar2, ball, drawFunction) => {
  const moveBall = () => {
    ball.x += ball.direction.x * ball.speed;
    ball.y += ball.direction.y * ball.speed;
    if (isBallHitWall(canvas, ball)) {
      ball.direction.y *= -1;
    }
  };

  /**
   * 공이 벽에 부딪혔는지 확인하는 함수
   * @param canvas {HTMLElement} 게임이 실행될 캔버스
   * @param ball {object} 공의 x, y, radius, direction, speed
   */
  const isBallHitWall = (canvas, ball) => {
    let topPoint = ball.y - ball.radius;
    let bottomPoint = ball.y + ball.radius;

    return topPoint <= 0 || bottomPoint >= canvas.offsetHeight;
  };

  moveBall();
};
