import { importCss } from "../../utils/importCss.js";
import { hover } from "../../utils/hoverEvent.js";
import userBox from "./userBox.js";
import useState from "../../utils/useState.js";
import { navigate } from "../../utils/navigate.js";
import { click } from "../../utils/clickEvent.js";
import { WEBSOCKET } from "../../global.js";
import { getUserMe } from "../../utils/userUtils.js";
/**
 * @param {HTMLElement} $container
 * @param {object} info
 */
export default function WaitingRoom($container, info = null) {
  // 새로고침 누르면 game-mode로 이동
  if (info === null) {
    navigate("/game-mode");
    return;
  }
  let userNickname = null;
  let players = info.data.players;

  getUserMe().then((user) => {
    userNickname = user.data.nickname;
  });

  const gameModeNum = info.data.mode;
  const ws = info.socket;

  const init = () => {
    render();
    if (info.password)
      $container.querySelector(".room-lock").style.display = "block";
    hover(
      $container.querySelector(".room-lock"),
      () => {
        $container.querySelector(".room-password-modal").style.display =
          "inline";
      },
      () => {
        $container.querySelector(".room-password-modal").style.display = "none";
      },
    );
    ws.onmessage = (msg) => {
      let data = JSON.parse(msg.data);
      console.log(data);
      if (data.type === "game_info") {
        const player = info.data.players.find(
          (player) => player.nickname === userNickname,
        );
        if (
          (data.data.mode === 1 && data.data.players.length === 4) ||
          (data.data.mode === 0 &&
            data.data.players.length === 2 &&
            player.is_manager)
        ) {
          $container.querySelector(".start-btn").style.display = "inline-block";
        } else {
          $container.querySelector(".start-btn").style.display = "none";
        }
        players = data.data.players;
        setUserState(players);
      } else {
        console.log(data);
        const newWs = new WebSocket(`${WEBSOCKET}${data.data}`);
        newWs.onmessage = (msg) => {
          let data = JSON.parse(msg.data);
          navigate("/match-up", { socket: newWs, data: data });
        };
      }
    };

    click($container.querySelector(".start-btn"), () => {
      ws.send(
        JSON.stringify({
          type: "game_start",
          data: "true",
        }),
      );
    });
  };

  this.unmount = () => {
    ws.close();
  };
  const render = () => {
    importCss("../../../assets/css/waiting-room.css");
    $container.innerHTML = `
      <div class="waiting-room-wrapper" style="background-image: url('../../../assets/images/game_room_bg_trans.png'); background-size: 100% 50%; background-repeat: no-repeat; background-position: center bottom; width: 100vw; height: 88vh; display: flex; flex-direction: column; justify-content: center; align-items: center">
        <div class="room-name-box" style="padding-left: 5vw; align-self: flex-start;display: flex; align-items: center; margin-top: 2vh">
          <img class="room-lock" alt="lock" src="../../../assets/images/password.png" style="display: none; margin-bottom: 0.4vh; width: 2vw; height: 2.8vh; -webkit-user-drag: none; user-select: none;">
          <div class="room-name-text" style="margin-left: 1vw; font-size: 3vh;font-family: Galmuri11,serif; color: white">${info.data.title} [${info.data.mode === 1 ? "토너먼트" : "1vs1"}]</div>
        </div>
        <div class="room-password-modal" style="position: fixed; top: 22vh; left: 1vw; display: none; margin-left: 5vw; font-size: 1.5vh; color: white; font-family: Galmuri11,serif">
          <span style="background-color: black; padding: 0.4vh;">${info.password}</span>
        </div>
        <div class="user-box-wrapper" style="width: 100vw; height: 65vh; display : flex; flex-direction: row">
          ${userBox(gameModeNum, players)}
        </div>
        <div class="start-btn-wrapper" style="width: 100vw; height: 10vh; display: flex; justify-content: center; align-items: center">
          <button class="start-btn" style="background: linear-gradient(to bottom, #D80000, #FF0000); font-family: Galmuri11-Bold, serif; color: white; border: 4px solid darkred; padding: 10px 40px; text-align: center; text-decoration: none; display: none; font-size: 32px; margin: 4px 2px; cursor: pointer; border-radius: 5vh;">START</button>
        </div>
      </div>
    `;
  };

  this.renderUserBox = () => {
    $container.querySelector(".user-box-wrapper").innerHTML = `
       ${userBox(gameModeNum, getUserState())}
      `;
  };

  init();
  let [getUserState, setUserState] = useState(players, this, "renderUserBox");
}
