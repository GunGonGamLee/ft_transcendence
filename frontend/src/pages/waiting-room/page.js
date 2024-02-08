import { importCss } from "../../utils/importCss.js";
import { hover } from "../../utils/hoverEvent.js";
import userBox from "./userBox.js";
import countdownModal from "./countdownModal.js";
import errorModal from "./errorModal.js";
import roomSettingModal from "./roomSettingModal.js";
/**
 * @param {HTMLElement} $container
 */
export default function WaitingRoom($container) {
  this.$container = $container;
  this.roomTitle = "방 제목";
  this.gameMode = "게임 모드";
  this.password = "password";
  this.gameModeNum = 4;
  this.init = () => {
    this.render();
    hover(
      this.$container.querySelector(".room-lock"),
      () => {
        this.$container.querySelector(".room-password-modal").style.display =
          "inline";
      },
      () => {
        this.$container.querySelector(".room-password-modal").style.display =
          "none";
      },
    );
  };

  this.render = () => {
    importCss("../../../assets/css/waiting-room.css");
    this.$container.innerHTML = `
      ${countdownModal(false)}
      ${errorModal(false)}
      ${roomSettingModal(true)}
      <div class="waiting-room-wrapper" style="background-image: url('../../../assets/images/game_room_bg_trans.png'); background-size: 100% 50%; background-repeat: no-repeat; background-position: center bottom; width: 100vw; height: 88vh; display: flex; flex-direction: column; justify-content: center; align-items: center">
        <div class="room-name-box" style="align-self: flex-start;display: flex; align-items: center; margin-top: 2vh">
          <img class="room-lock" alt="lock" src="../../../assets/images/password.png" style="margin-left: 5vw; margin-bottom: 0.4vh; width: 2vw; height: 2.8vh; -webkit-user-drag: none; user-select: none;">
          <div class="room-name-text" style="margin-left: 1vw; font-size: 3vh;font-family: Galmuri11,serif; color: white">${this.roomTitle} | ${this.gameMode}</div>
          <img class="room-name-edit" alt="setting" src="../../../assets/images/setting.png" style="margin-left: 0.5vw; margin-bottom: 0.4vh; width: 1.8vw; height: 3vh;-webkit-user-drag: none; user-select: none;">
        </div>
          <div class="room-password-modal" style="display: none; margin-left: 5vw; font-size: 1.5vh; color: white; font-family: Galmuri11,serif">
            <span style="background-color: black; padding: 0.4vh;">${this.password}</span>
          </div>
          ${userBox(this.gameModeNum)}
          <div class="start-btn-wrapper" style="width: 100vw; height: 10vh; display: flex; justify-content: center; align-items: center">
            <button class="start-btn" style="background: linear-gradient(to bottom, #D80000, #FF0000); font-family: Galmuri11-Bold, serif; color: white; border: 4px solid darkred; padding: 10px 40px; text-align: center; text-decoration: none; display: inline-block; font-size: 32px; margin: 4px 2px; cursor: pointer; border-radius: 5vh;">START</button>
          </div>
      </div>
        `;
  };
  this.init();
}
