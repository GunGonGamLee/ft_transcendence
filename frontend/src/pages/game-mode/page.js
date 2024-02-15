import { importCss } from "../../utils/importCss.js";
import gameModeUnit from "./gameModeUnit.js";
import { click } from "../../utils/clickEvent.js";
import { navigate } from "../../utils/navigate.js";
/**
 * @param {HTMLElement} $container
 */

export default function GameMode($container) {
  const init = () => {
    render();
    click($container.querySelector(".unit0"), () => {
      $container.querySelector(".queue-modal").style.display = "flex";
    });
    click($container.querySelector(".run-btn"), () => {
      $container.querySelector(".queue-modal").style.display = "none";
    });
  };

  const render = () => {
    importCss("../../../assets/css/game-mode.css");
    $container.innerHTML = `
      <div class="game-mode-container">
      ${gameModeUnit(0)}
      ${gameModeUnit(1)}
      ${gameModeUnit(2)}
      </div>
      <div class="queue-modal" style="display: none; position: fixed; top: 50%; left: 50%; border-radius: 25px; border: 5px yellow solid; transform: translate(-50%, -50%); width: 50%; height: 50%; background-color: black; flex-direction: column; justify-content: center; align-items: center">
        <div style="color: white; font-size: 48px; font-family: Galmuri11, serif; font-weight: 700; word-wrap: break-word; margin-bottom: 4vh">대기 중</div>
        <div class="spinner-border text-light" style="width: 4rem; height: 4rem" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <button type="button" class="btn btn-danger run-btn" style="margin-top: 6vh; font-family: Galmuri11, serif">도망가기</button>
      </div>
	  `;
  };

  init();
}
