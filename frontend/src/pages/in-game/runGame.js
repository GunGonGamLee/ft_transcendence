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
    } else if (isBallHitBar(bar1, ball) || isBallHitBar(bar2, ball)) {
      ball.direction.x *= -1;
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

  const isBallHitBar = (bar, ball) => {
    let maxRangeOfHitPoint =
      Math.sqrt(Math.pow(bar.width / 2, 2) + Math.pow(bar.height / 2, 2)) +
      ball.radius;
    let minRangeOfHitPoint = bar.width / 2 + self.radius;
    let barCenterPos = {
      x: bar.x + bar.width / 2,
      y: bar.y + bar.height / 2,
    };
    let a = Math.abs(barCenterPos.x - ball.x);
    let b = Math.abs(barCenterPos.y - ball.y);
    let c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
    return minRangeOfHitPoint <= c && c <= maxRangeOfHitPoint;
  };

  moveBall();
};
