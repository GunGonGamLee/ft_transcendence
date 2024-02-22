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
    if (does_ball_hit_wall(canvas, ball)) {
      ball.direction.y *= -1;
    }
  };
};
