import { importCss } from "../../utils/importCss.js";
import { hover } from "../../utils/hoverEvent.js";
import userBox from "./userBox.js";
import countdownModal from "./countdownModal.js";
import useState from "../../utils/useState.js";
import { click } from "../../utils/clickEvent.js";
import { navigate } from "../../utils/navigate.js";
/**
 * @param {HTMLElement} $container
 * @param {object} info
 */
export default function WaitingRoom($container, info = null) {
  let roomTitle = "방 제목";
  let gameMode = "게임 모드";
  let password = "password";
  let gameModeNum = 4;

  // 새로고침 누르면 game-mode로 이동
  if (info != null) {
    navigate("/game-mode");
  }
  const ws = info.socket;
  console.log(info);

  console.log(info);
  let props = [
    {
      img: "../../../assets/images/avatar/red_bust.png",
      nickname: "donghyk2",
      rating: 2400,
      status: "오우-너",
      color: "yellow",
    },
    {
      img: "../../../assets/images/avatar/blue_bust.png",
      nickname: "john",
      rating: 2200,
      status: "준비 중",
      color: "white",
    },
    {
      img: "../../../assets/images/avatar/yellow_bust.png",
      nickname: "bob",
      rating: 2300,
      status: "준비 중",
      color: "white",
    },
    {
      img: "../../../assets/images/avatar/green_bust.png",
      nickname: "garry",
      rating: 2300,
      status: "준비 중",
      color: "white",
    },
  ];

  let props2 = [
    {
      img: "../../../assets/images/avatar/red_bust.png",
      nickname: "업데이트이름",
      rating: 240,
      status: "오우-너",
      color: "yellow",
    },
    {
      img: "../../../assets/images/avatar/blue_bust.png",
      nickname: "업데이트이름",
      rating: 2200,
      status: "비 중",
      color: "white",
    },
    {
      img: "../../../assets/images/avatar/yellow_bust.png",
      nickname: "업데이트이름",
      rating: 2300,
      status: "준비 중",
      color: "white",
    },
    {
      img: "../../../assets/images/avatar/green_bust.png",
      nickname: "업데이트이름",
      rating: 2300,
      status: "준비 중",
      color: "white",
    },
  ];

  // let connectWebSocket = () => {
  //   this.ws = new WebSocket('wss://' +
  //     window.location.host +
  //     '/ws/games/' +
  //     roomName);
  // };
  const init = () => {
    // connectWebSocket();
    render();
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
    click($container.querySelector(".start-btn"), () => {
      setUserState(props2);
    });
  };

  const render = () => {
    importCss("../../../assets/css/waiting-room.css");
    $container.innerHTML = `
      ${countdownModal(false)}
      <div class="waiting-room-wrapper" style="background-image: url('../../../assets/images/game_room_bg_trans.png'); background-size: 100% 50%; background-repeat: no-repeat; background-position: center bottom; width: 100vw; height: 88vh; display: flex; flex-direction: column; justify-content: center; align-items: center">
        <div class="room-name-box" style="align-self: flex-start;display: flex; align-items: center; margin-top: 2vh">
          <img class="room-lock" alt="lock" src="../../../assets/images/password.png" style="margin-left: 5vw; margin-bottom: 0.4vh; width: 2vw; height: 2.8vh; -webkit-user-drag: none; user-select: none;">
          <div class="room-name-text" style="margin-left: 1vw; font-size: 3vh;font-family: Galmuri11,serif; color: white">${roomTitle} | ${gameMode}</div>
        </div>
        <div class="room-password-modal" style="position: fixed; top: 22vh; left: 1vw; display: none; margin-left: 5vw; font-size: 1.5vh; color: white; font-family: Galmuri11,serif">
          <span style="background-color: black; padding: 0.4vh;">${password}</span>
        </div>
        <div class="user-box-wrapper" style="width: 100vw; height: 65vh; display : flex; flex-direction: row">
          ${userBox(gameModeNum, props)}
        </div>
        <div class="start-btn-wrapper" style="width: 100vw; height: 10vh; display: flex; justify-content: center; align-items: center">
          <button class="start-btn" style="background: linear-gradient(to bottom, #D80000, #FF0000); font-family: Galmuri11-Bold, serif; color: white; border: 4px solid darkred; padding: 10px 40px; text-align: center; text-decoration: none; display: inline-block; font-size: 32px; margin: 4px 2px; cursor: pointer; border-radius: 5vh;">START</button>
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
  let [getUserState, setUserState] = useState(props, this, "renderUserBox");
}
