import useState from "../../utils/useState.js";
import scoreBar from "./scoreBar.js";
import toast from "./toast.js";
import { navigate } from "../../utils/navigate.js";
import deepCopy from "../../utils/deepCopy.js";
/**
 *
 * @param {HTMLElement} $container
 * @param {Object} info
 * @constructor
 */
export default function LocalGame($container, info = null) {
  if (info === null) {
    navigate("/game-mode");
    return;
  }

  let scoreInput = { player1: 0, player2: 0 };
  let [getScore, setScore] = useState(scoreInput, this, "renderScoreBoard");
  let [getTime, setTime] = useState(0, this, "renderTime");
  const BALL_SPEED = 7;

  const init = () => {
    hideHeader();
    this.render();
    this.renderScoreBoard();
    this.timeIntervalId = setInterval(() => {
      setTime(getTime() + 1);
    }, 1000);
    this.gameAnimationId = window.requestAnimationFrame(() =>
      runGame(canvas, bar1, bar2, ball, draw),
    );
    document.addEventListener("keydown", keyEventHandler);

    const $toast = document.querySelector(".toast");
    const toast = new bootstrap.Toast($toast);
    toast.show(); // Toast를 보여줍니다.
  };
  this.unmount = () => {
    clearInterval(this.timeIntervalId);
    cancelAnimationFrame(this.gameAnimationId);
    cancelAnimationFrame(this.barAnimationId);
    document.querySelector("#header").style.display = "block";
    document.removeEventListener("keydown", keyEventHandler);
  };

  this.render = () => {
    $container.innerHTML = `
			${scoreBar(info)}
      ${toast()}
			<div class="in-game" style="height: 100vh; width: 100vw; background-image: url('../../../assets/images/ingame_background.png'); background-size: cover"></div>
			<canvas id="gameCanvas" style="position: absolute; top: 12vh; left: 6%; width: 88%; height: 88%;border-left: 3px dotted white; border-right: 3px dotted white;"></canvas>
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

  const keyEventHandler = (e) => {
    switch (e.key) {
      // background image 변경
      case "1":
        $container.querySelector(".in-game").style.backgroundImage =
          "url('../../../assets/images/ingame_background.png')";
        break;
      case "2":
        $container.querySelector(".in-game").style.backgroundImage =
          "url('../../../assets/images/ingame_background2.png')";
        break;
      case "3":
        $container.querySelector(".in-game").style.backgroundImage =
          "url('../../../assets/images/ingame_background3.png')";
        break;
      case "4":
        $container.querySelector(".in-game").style.backgroundImage =
          "url('../../../assets/images/ingame_background4.png')";
        break;
      // 여기에 send 로직도 추가해야함
      default:
        break;
    }
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
  canvas.width = document.body.clientWidth;
  canvas.height = document.body.clientHeight * 0.88; // header의 height가 12vh이므로 88%만큼의 height를 가짐

  // 초기 위치 설정
  let commonBarInfo = {
    width: canvas.width * 0.02,
    height: canvas.height * 0.3,
    speed: BALL_SPEED,
  };
  let bar1 = {
    x: 0,
    y: canvas.height / 2 - 50,
    ...commonBarInfo,
  };
  let bar2 = {
    x: canvas.width - commonBarInfo.width,
    y: canvas.height / 2 - 50,
    ...commonBarInfo,
  };
  let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: canvas.width * 0.02,
    direction: {
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
    },
    speed: BALL_SPEED,
  };

  let keyDown = {};
  this.barAnimationId = null;

  const moveBar = () => {
    // bar1 이동
    if (keyDown["w"]) {
      bar1.y = Math.max(bar1.y - bar1.speed, 0);
    } else if (keyDown["s"]) {
      bar1.y = Math.min(bar1.y + bar1.speed, canvas.height - bar1.height);
    }

    // bar2 이동
    if (keyDown["ArrowUp"]) {
      bar2.y = Math.max(bar2.y - bar2.speed, 0);
    } else if (keyDown["ArrowDown"]) {
      bar2.y = Math.min(bar2.y + bar2.speed, canvas.height - bar2.height);
    }
    this.barAnimationId = requestAnimationFrame(moveBar);
  };

  const getKeyDown = (e) => {
    if (e.key === "w" || e.key === "W" || e.key === "ㅈ") keyDown["w"] = true;
    else if (e.key === "s" || e.key === "S" || e.key === "ㄴ")
      keyDown["s"] = true;
    else if (e.key === "ArrowUp") keyDown["ArrowUp"] = true;
    else if (e.key === "ArrowDown") keyDown["ArrowDown"] = true;
  };

  const getKeyUp = (e) => {
    if (e.key === "w" || e.key === "W" || e.key === "ㅈ") keyDown["w"] = false;
    else if (e.key === "s" || e.key === "S" || e.key === "ㄴ")
      keyDown["s"] = false;
    else if (e.key === "ArrowUp") keyDown["ArrowUp"] = false;
    else if (e.key === "ArrowDown") keyDown["ArrowDown"] = false;
  };

  window.addEventListener("keydown", getKeyDown);
  window.addEventListener("keyup", getKeyUp);

  /**
   * 게임 실행 함수
   * @param canvas {HTMLElement} 게임이 실행될 캔버스
   * @param bar1 {object} 바의 x, y, width, height, speed
   * @param bar2 {object} 바의 x, y, width, height, speed
   * @param ball {object} 공의 x, y, radius, direction, speed
   * @param drawFunction {function} 캔버스를 그리는 함수
   */
  const runGame = (canvas, bar1, bar2, ball, drawFunction) => {
    let isBounced = false;

    const moveBall = () => {
      if (isBallInsideBar(bar1, ball) || isBallInsideBar(bar2, ball)) {
        bounce(true, false);
      } else if (isBallHitWall(canvas, ball)) {
        bounce(false, true);
      } else {
        isBounced = false;
      }
      ball.x = ball.x + ball.direction.x * ball.speed;
      ball.y = ball.y + ball.direction.y * ball.speed;
      ball.speed += 0.001;
      let whetherScoreAGoal = isBallHitGoal(canvas, ball);
      if (whetherScoreAGoal[0] || whetherScoreAGoal[1]) {
        updateScore(whetherScoreAGoal);
        reset(ball, canvas);
        pause(1000);
      }
      drawFunction(bar1, bar2, ball);
      let moveBallEventId = window.requestAnimationFrame(moveBall);
      if (getScore().player1 + getScore().player2 >= 1) {
        // TODO: 게임 종료 스코어 나중에 고치기
        cancelAnimationFrame(moveBallEventId);
        // 게임 종료
        if (info.finalPlayer1 === null) {
          info.finalPlayer1 =
            getScore().player1 > getScore().player2
              ? info.player1
              : info.player2;
        } else if (info.finalPlayer2 === null) {
          info.finalPlayer2 =
            getScore().player1 > getScore().player2
              ? info.player3
              : info.player4;
        } else {
          alert(
            `승자는 ${getScore().player1 > getScore().player2 ? info.finalPlayer1 : info.finalPlayer2} 입니다`,
          );
          navigate("/game-mode");
          return;
        }
        const newInfo = deepCopy(info);
        navigate("/local-game", newInfo);
      }
    };

    /**
     * 공이 벽에 부딪혔는지 확인하는 함수
     * @param canvas {HTMLCanvasElement} 게임이 실행될 캔버스
     * @param ball {object} 공의 x, y, radius, direction, speed
     */
    const isBallHitWall = (canvas, ball) => {
      let topPoint = ball.y - ball.radius;
      let bottomPoint = ball.y + ball.radius;

      if (topPoint <= 0 && !isBounced) {
        ball.y += Math.abs(topPoint);
        return true;
      } else if (bottomPoint >= canvas.height && !isBounced) {
        ball.y -= bottomPoint - canvas.height;
        return true;
      }
      return false;
    };

    /**
     * 공이 바의 x축 내부에 있는지 확인하는 함수
     * @param bar {object} 바의 x, y, width, height, speed
     * @param ball {object} 공의 x, y, radius, direction, speed
     * @returns {boolean} 바의 x축 내부에 있으면 true, 아니면 false
     */
    const isBallInsideBarX = (bar, ball) => {
      return (
        (ball.x + ball.radius > bar.x &&
          ball.x + ball.radius < bar.x + bar.width) ||
        (ball.x - ball.radius > bar.x &&
          ball.x - ball.radius < bar.x + bar.width)
      );
    };

    /**
     * 공이 바의 y축 내부에 있는지 확인하는 함수
     * @param bar {object} 바의 x, y, width, height, speed
     * @param ball {object} 공의 x, y, radius, direction, speed
     * @returns {boolean} 바의 y축 내부에 있으면 true, 아니면 false
     */
    const isBallInsideBarY = (bar, ball) => {
      return (
        (ball.y + ball.radius > bar.y &&
          ball.y + ball.radius < bar.y + bar.height) ||
        (ball.y - ball.radius > bar.y &&
          ball.y - ball.radius < bar.y + bar.height)
      );
    };

    /**
     * 공이 바에 부딪혔는지 확인하는 함수. 공의 충돌은 공이 바의 내부에 있는지를 기준으로 판단한다.
     * @param bar {object} 바의 x, y, width, height, speed
     * @param ball {object} 공의 x, y, radius, direction, speed
     * @returns {boolean} 바에 부딪혔으면 true, 아니면 false
     */
    const isBallInsideBar = (bar, ball) => {
      return isBallInsideBarX(bar, ball) && isBallInsideBarY(bar, ball);
    };

    const isBallHitGoal = (canvas, ball) => {
      if (ball.x <= 0) {
        return [false, true];
      } else if (ball.x >= canvas.width) {
        return [true, false];
      }
      return [false, false];
    };

    const updateScore = (whetherScoreAGoal) => {
      if (whetherScoreAGoal[0]) {
        setScore({
          player1: getScore().player1 + 1,
          player2: getScore().player2,
        });
      } else if (whetherScoreAGoal[1]) {
        setScore({
          player1: getScore().player1,
          player2: getScore().player2 + 1,
        });
      }
    };

    /**
     * 공이 벽에 부딪혔을 때 방향을 바꾸는 함수
     * @param bounceX {boolean} x축으로 부딪혔는지 여부
     * @param bounceY {boolean} y축으로 부딪혔는지 여부
     */
    const bounce = (bounceX, bounceY) => {
      if (bounceX && !isBounced) {
        [ball.direction.x, ball.direction.y] = normalizeVector(
          ball.direction.x * -1 * getRandomCoefficient(0.99, 1.01),
          ball.direction.y,
        );
        isBounced = true;
      } else if (bounceY && !isBounced) {
        [ball.direction.x, ball.direction.y] = normalizeVector(
          ball.direction.x,
          ball.direction.y * -1 * getRandomCoefficient(0.99, 1.01),
        );
        isBounced = true;
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
      normalize;
      Vector(ball.direction.x, ball.direction.y);
      ball.speed = BALL_SPEED;
      isBounced = false;
    };

    /**
     * 최소값과 최대값 사이의 랜덤한 수를 반환하는 함수
     */
    const getRandomCoefficient = (min, max) => {
      return Math.random() * (max - min) + min;
    };

    /**
     * 벡터를 정규화하는 함수
     * @param x {number} x축 방향 벡터
     * @param y {number} y축 방향 벡터
     * @returns {number[]} 정규화된 벡터
     */
    const normalizeVector = (x, y) => {
      let vectorLength = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
      let normalizedX = x / vectorLength;
      let normalizedY = y / vectorLength;
      return [normalizedX, normalizedY];
    };

    const pause = (ms) => {
      const end = Date.now() + ms;
      while (Date.now() < end) {}
    };

    reset(ball, canvas);
    moveBar();
    moveBall();
  };
}
