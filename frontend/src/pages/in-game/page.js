import useState from "../../utils/useState.js";
import scoreBar from "./scoreBar.js";

/**
 *
 * @param {HTMLElement} $container
 * @param {Object} info
 * @constructor
 */
export default function InGame($container, info) {
  console.log(info.mode);
  const scoreInput = { player1: 0, player2: 0 };
  let [getScore, setScore] = useState(scoreInput, this, "renderScoreBoard");
  let [getTime, setTime] = useState(0, this, "renderTime");
  let fps = (1 / 60) * 1000;
  let speedCoefficient = 0.8;

  const init = () => {
    hideHeader();
    this.render();
    this.renderScoreBoard();
    this.intervalId = setInterval(() => {
      setTime(getTime() + 1);
    }, 1000);
  };
  this.unmount = () => {
    clearInterval(this.intervalId);
    document.querySelector("#header").style.display = "block";
  };

  this.render = () => {
    $container.innerHTML = `
			${scoreBar()}
			<div class="in-game" style="height: 100vh; width: 100vw; background-image: url('../../../assets/images/ingame_background.png'); background-size: cover">
			<canvas id="gameCanvas" style="position: absolute; top: 12vh; left: calc((100vw - 88%) / 2); width: 88%; height: 88%;"></canvas>
			`;
  };
  this.renderScoreBoard = () => {
    $container.querySelector(".score-board").innerHTML = `
				<span style="color: yellow; font-size: 6vh; margin: auto;">${getScore().player1} 대 ${getScore().player2}</span>
		`;
  };

  this.renderTime = () => {
    let time = getTime();
    $container.querySelector(".time").innerText =
      `${Math.floor(time / 60)}:${time % 60 < 10 ? "0" + (time % 60) : time % 60}`;
  };

  const hideHeader = () => {
    document.querySelector("#header").style.display = "none";
  };

  /**
   * 바 두 개와 공의 데이터를 받아서 화면에 그리는 함수.
   * @param bar1 {object} x, y, width, height
   * @param bar2 {object} x, y, width, height
   * @param ball {object} x, y, radius
   */
  function draw(bar1, bar2, ball) {
    // 화면 클리어
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // bar1 그리기
    ctx.fillStyle = "#00FF00"; // 녹색
    ctx.fillRect(bar1.x, bar1.y, bar1.width, bar1.height);

    // bar2 그리기
    ctx.fillStyle = "#FFFF00"; // 노란색
    ctx.fillRect(bar2.x, bar2.y, bar2.width, bar2.height);

    // ball 그리기
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, true);
    ctx.fillStyle = "#FFFFFF"; // 흰색
    ctx.fill();
  }

  init();
  const canvas = $container.querySelector("#gameCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 800;
  canvas.height = 400;

  // 초기 위치 설정
  let bar1 = {
    x: 10,
    y: canvas.height / 2 - 50,
    width: 20,
    height: 100,
    speed: 10,
  };
  let bar2 = {
    x: canvas.width - 30,
    y: canvas.height / 2 - 50,
    width: 20,
    height: 100,
    speed: 10,
  };
  let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    direction: {
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
    },
    speed: fps * speedCoefficient,
  };

  window.addEventListener("keydown", (e) => {
    // bar1 이동
    if (e.key === "w" || e.key === "W" || e.key === "ㅈ") {
      bar1.y = Math.max(bar1.y - bar1.speed, 0);
    } else if (e.key === "s" || e.key === "S" || e.key === "ㄴ") {
      bar1.y = Math.min(bar1.y + bar1.speed, canvas.height - bar1.height);
    }

    // bar2 이동
    if (e.key === "ArrowUp") {
      bar2.y = Math.max(bar2.y - bar2.speed, 0);
    } else if (e.key === "ArrowDown") {
      bar2.y = Math.min(bar2.y + bar2.speed, canvas.height - bar2.height);
    }

    draw(bar1, bar2, ball); // 키보드 이벤트 후 상태를 반영하여 다시 그림
  });

  draw(bar1, bar2, ball); // 초기 상태 그리기

  /**
   * 게임 실행 함수
   * @param canvas {HTMLElement} 게임이 실행될 캔버스
   * @param bar1 {object} 바의 x, y, width, height, speed
   * @param bar2 {object} 바의 x, y, width, height, speed
   * @param ball {object} 공의 x, y, radius, direction, speed
   * @param drawFunction {function} 캔버스를 그리는 함수
   */
  const runGame = (canvas, bar1, bar2, ball, drawFunction) => {
    const moveBall = () => {
      ball.x += ball.direction.x * ball.speed;
      ball.y += ball.direction.y * ball.speed;
      if (isBallHitWall(canvas, ball)) {
        ball.direction.y *= -1;
      } else if (isBallHitBar(bar1, ball) || isBallHitBar(bar2, ball)) {
        ball.direction.x *= -1;
      }
      let wheterScoreAGoal = isBallHitGoal(canvas, ball);
      if (wheterScoreAGoal[0] || wheterScoreAGoal[1]) {
        updateScore(wheterScoreAGoal);
        reset(ball, canvas);
      }
      drawFunction(bar1, bar2, ball);
    };

    /**
     * 공이 벽에 부딪혔는지 확인하는 함수
     * @param canvas {HTMLCanvasElement} 게임이 실행될 캔버스
     * @param ball {object} 공의 x, y, radius, direction, speed
     */
    const isBallHitWall = (canvas, ball) => {
      let topPoint = ball.y - ball.radius;
      let bottomPoint = ball.y + ball.radius;

      return topPoint <= 0 || bottomPoint >= canvas.height;
    };

    /**
     * 공이 바에 부딪혔는지 확인하는 함수
     * @param bar {object} 바의 x, y, width, height, speed
     * @param ball {object} 공의 x, y, radius, direction, speed
     * @returns {boolean} 바에 부딪혔으면 true, 아니면 false
     */
    const isBallHitBar = (bar, ball) => {
      let maxRangeOfHitPoint =
        Math.sqrt(Math.pow(bar.width / 2, 2) + Math.pow(bar.height / 2, 2)) +
        ball.radius; // 바의 대각선 길이 + 공의 반지름 = 바의 중심으로부터 공의 중심까지의 거리 중 최대값
      let minRangeOfHitPoint = bar.width / 2 + self.radius; // 바의 가로길이 / 2 + 공의 반지름 = 바의 중심으로부터 공의 중심까지의 거리 중 최소값
      let barCenterPos = {
        x: bar.x + bar.width / 2,
        y: bar.y + bar.height / 2,
      };
      let a = Math.abs(barCenterPos.x - ball.x);
      let b = Math.abs(barCenterPos.y - ball.y);
      let c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
      return minRangeOfHitPoint <= c && c <= maxRangeOfHitPoint;
    };

    const isBallHitGoal = (canvas, ball) => {
      if (ball.x <= 0) {
        return [true, false];
      } else if (ball.x >= canvas.width) {
        return [false, true];
      }
      return [false, false];
    };

    const updateScore = (wheterScoreAGoal) => {
      console.log(scoreInput);
      if (wheterScoreAGoal[0]) {
        setScore(scoreInput.player1 + 1);
      } else if (wheterScoreAGoal[1]) {
        setScore(scoreInput.player2 + 1);
      }
    };

    /**
     * 공의 위치를 초기화하는 함수
     * @param ball {object} 공의 x, y, radius, direction, speed
     * @param canvas {HTMLCanvasElement} 게임이 실행될 캔버스
     */
    const reset = (ball, canvas) => {
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
      ball.direction = {
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
      };
      ball.speed = fps * speedCoefficient;
    };
    moveBall();
  };
  window.setInterval(() => runGame(canvas, bar1, bar2, ball, draw), fps);
}
