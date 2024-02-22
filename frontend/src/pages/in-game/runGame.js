export const runGame = (canvas, bar1, bar2, ball) => {
  const init = () => {
    let ball_direction = {
      x: Math.round(Math.random()) * 2 - 1,
      y: Math.round(Math.random()) * 2 - 1,
    };
    this.canvas = canvas;
    this.bar1 = bar1;
    this.bar2 = bar2;
    this.ball = {
      ...ball,
      speed: 10,
      direction: ball_direction,
    };
  };
};
