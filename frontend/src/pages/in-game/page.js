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

  function draw() {
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
  let bar1 = { x: 10, y: canvas.height / 2 - 50, width: 20, height: 100 };
  let bar2 = {
    x: canvas.width - 30,
    y: canvas.height / 2 - 50,
    width: 20,
    height: 100,
  };
  let ball = { x: canvas.width / 2, y: canvas.height / 2, radius: 10 };

  window.addEventListener("keydown", (e) => {
    // bar1 이동
    if (e.key === "w" || e.key === "W" || e.key === "ㅈ") {
      bar1.y = Math.max(bar1.y - 10, 0);
    } else if (e.key === "s" || e.key === "S" || e.key === "ㄴ") {
      bar1.y = Math.min(bar1.y + 10, canvas.height - bar1.height);
    }

    // bar2 이동
    if (e.key === "ArrowUp") {
      bar2.y = Math.max(bar2.y - 10, 0);
    } else if (e.key === "ArrowDown") {
      bar2.y = Math.min(bar2.y + 10, canvas.height - bar2.height);
    }

    draw(); // 키보드 이벤트 후 상태를 반영하여 다시 그림
  });

  draw(); // 초기 상태 그리기
}
