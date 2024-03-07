import useState from "../../utils/useState.js";
import scoreBar from "./scoreBar.js";
import toast from "./toast.js";
/**
 *
 * @param {HTMLElement} $container
 * @param {Object} info
 * @constructor
 */
export default function OnlineGame($container, info) {
  console.log(info);
  const ws = info.socket;
  let scoreInput = { player1: 0, player2: 0 };
  let [getScore, setScore] = useState(scoreInput, this, "renderScoreBoard");
  let [getTime, setTime] = useState(0, this, "renderTime");

  const init = () => {
    hideHeader();
    this.render();
    this.renderScoreBoard();
    this.timeIntervalId = setInterval(() => {
      setTime(getTime() + 1);
    }, 1000);
    document.addEventListener("keydown", keyEventHandler);

    const $toast = document.querySelector(".toast");
    const toast = new bootstrap.Toast($toast);
    toast.show(); // Toast를 보여줍니다.
    window.addEventListener("beforeunload", disconnectWebSocket);
  };

  const disconnectWebSocket = () => {
    ws.close();
  };

  this.unmount = () => {
    clearInterval(this.timeIntervalId);
    document.querySelector("#header").style.display = "block";
    document.removeEventListener("keydown", keyEventHandler);
    window.removeEventListener("beforeunload", disconnectWebSocket);
  };
  // TODO: avatar 하드코딩된거 나중에 수정하기 중복 코드 gameutils.js로 따로 빼기
  this.render = () => {
    $container.innerHTML = `
    ${scoreBar()}
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
      case "ArrowUp":
        console.log("up");
        ws.send(JSON.stringify({ type: "keyboard", data: "up" }));
        break;
      case "ArrowDown":
        console.log("down");
        ws.send(JSON.stringify({ type: "keyboard", data: "down" }));
        break;
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
  console.log(canvas.width, canvas.height);

  let bar1 = { x: 10, y: canvas.height / 2 - 50, width: 20, height: 100 };
  let bar2 = {
    x: canvas.width - 30,
    y: canvas.height / 2 - 50,
    width: 20,
    height: 100,
  };
  let ball = { x: canvas.width / 2, y: canvas.height / 2, radius: 10 };
  ws.send(
    JSON.stringify({
      type: "start",
      data: {
        map_width: canvas.width,
        map_height: canvas.height,
      },
    }),
  );

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log(data);
    if (data.type === "in_game") {
      bar1.x = data.data.left_side_player.x;
      bar1.y = data.data.left_side_player.y;
      bar1.width = 20;
      bar1.height = 100;
      bar2.x = data.data.right_side_player.x;
      bar2.y = data.data.right_side_player.y;
      bar2.width = 20;
      bar2.height = 100;
      ball.x = data.data.ball.x;
      ball.y = data.data.ball.y;
      draw(bar1, bar2, ball);
      let score = getScore();
      let newScore = {
        player1: data.data.left_side_player.score,
        player2: data.data.right_side_player.score,
      };
      if (
        score.player1 !== newScore.player1 ||
        score.player2 !== newScore.player2
      )
        setScore(newScore);
    } else if (data.type === "game_end") {
      // TODO: 승자면 match-up으로 이동 패자면 전적페이지로 game_id기반
      // TODO: 모든 info받는 페이지 null이면 game-mode로 navigate
    }
  };
}
