import useState from "../../utils/useState.js";
import scoreBar from "./scoreBar.js";
import toast from "./toast.js";
import { navigate } from "../../utils/navigate.js";
import { getUserMe } from "../../utils/userUtils.js";
/**
 *
 * @param {HTMLElement} $container
 * @param {Object} info
 * @constructor
 */
export default function OnlineGame($container, info) {
  if (info === null) {
    navigate("/game-mode");
    return;
  }
  console.log(info);
  const ws = info.socket;
  let scoreInput = { player1: 0, player2: 0 };
  let [getScore, setScore] = useState(scoreInput, this, "renderScoreBoard");
  let [getTime, setTime] = useState(0, this, "renderTime");
  // let keyState = { up: false, down: false };

  let myNickname = null;
  let myMatch = 1;
  let initMyInfo = async () => {
    myNickname = await getUserMe().then((user) => user.data.nickname);
    if (
      info.data.data.match2 && (
      info.data.data.match2[0].nickname === myNickname ||
      info.data.data.match2[1].nickname === myNickname)
    )
      myMatch = 2;
    else if (
      info.data.data.match3 && (
      info.data.data.match3[0].nickname === myNickname ||
      info.data.data.match3[1].nickname === myNickname)
    )
      myMatch = 3;
  };

  const init = () => {
    initMyInfo();
    hideHeader();
    this.render();
    this.renderScoreBoard();
    this.timeIntervalId = setInterval(() => {
      setTime(getTime() + 1);
    }, 1000);
    document.addEventListener("keydown", keyEventHandler);
    // document.addEventListener("keydown", keyDownHandler);
    // document.addEventListener("keyup", keyUpHandler);

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
    // document.removeEventListener("keydown", keyDownHandler);
    // document.removeEventListener("keyup", keyUpHandler);
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
        // if (keyState) console.log("up");
        ws.send(JSON.stringify({ type: "keyboard", data: "up" }));
        break;
      case "ArrowDown":
        // console.log("down");
        ws.send(JSON.stringify({ type: "keyboard", data: "down" }));
        break;
      default:
        break;
    }
  };

  // const keyDownHandler = (e) => {
  //   if (e.key === "ArrowUp") {
  //     keyState.up = true;
  //   } else if (e.key === "ArrowDown") {
  //     keyState.down = true;
  //   }
  // };
  // const keyUpHandler = (e) => {
  //   if (e.key === "ArrowUp") {
  //     if (keyState.up === false) return;
  //     keyState.up = false;
  //     console.log("up");
  //     ws.send(JSON.stringify({ type: "keyboard", data: "up" }));
  //   } else if (e.key === "ArrowDown") {
  //     if (keyState.down === false) return;
  //     keyState.down = false;
  //     console.log("down");
  //     ws.send(JSON.stringify({ type: "keyboard", data: "down" }));
  //   }
  // };

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
    // console.log(data);
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
    } else if (data.type === "game_end") endGame(data, ws);
  };
  let matchEndCnt = 0;
  function match3Logic(ws) {
    ws.onmessage = null;
    ws.send(JSON.stringify(
      {"type":"match3_info"}));
    ws.onmessage = (msg) => {
      let data = JSON.parse(msg.data);
      navigate(`/match-up`, { socket: ws, data: data, remainMatch: true });
    }
  }
  function endGame(data, ws) {
    console.log(myMatch, data);
    if (myMatch !== data.data.match) {
      matchEndCnt++;
      return;
    }

    let endData = data.data;
    let isWinner = endData.winner === myNickname;

    if (!endData.final) {
      if (isWinner) {
        if (matchEndCnt === 1) {
          match3Logic(ws);
        } else {
          ws.onmessage = (msg) => {
            const data = JSON.parse(msg.data);
            if (data.type === "game_end") {
              match3Logic(ws);
            }
          }
        }
      } else {
        navigate(
          `/histories/details?mode=${endData.game_mode}&gameId=${endData.game_id}`,
          { gameId: endData.game_id },
        );
      }
    } else {
      ws.close();
      navigate(
        `/histories/details?mode=${endData.game_mode}&gameId=${endData.game_id}`,
        { gameId: endData.game_id },
      );
    }
  }
}
