import { importCss } from "../../utils/importCss.js";
import gameModeUnit from "./gameModeUnit.js";
import { click } from "../../utils/clickEvent.js";
import { navigate } from "../../utils/navigate.js";
import { WEBSOCKET } from "../../global.js";

/**
 * @param {HTMLElement} $container
 */

export default function GameMode($container) {
  this.ws = null;
  const init = () => {
    render();
    click($container.querySelector(".unit1"), () => {
      $container.querySelector(".queue-modal").style.display = "flex";
      $container.querySelector(".modal-backdrop").style.display = "block";
      this.ws = new WebSocket(`${WEBSOCKET}/rankgames/`);
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const newWs = new WebSocket(`${WEBSOCKET}${data.url}`);
        this.ws.close();
        newWs.onmessage = (msg) => {
          let data = JSON.parse(msg.data);
          navigate("/match-up", { socket: newWs, data: data });
        };
      };
    });
    click($container.querySelector(".run-btn"), () => {
      $container.querySelector(".queue-modal").style.display = "none";
      $container.querySelector(".modal-backdrop").style.display = "none";
      if (this.ws) {
        this.ws.close();
      }
    });
    click($container.querySelector(".unit0"), () => {
      // navigate("/local-game", { mode: "rank" });
      navigate("/local-match-up");
    });
    click($container.querySelector(".unit2"), () => {
      navigate("/custom-game-list");
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
      <div class="modal-backdrop" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.5); z-index: 1;"></div>
      <div class="queue-modal" style="display: none; z-index: 2; position: fixed; top: 50%; left: 50%; border-radius: 25px; border: 5px yellow solid; transform: translate(-50%, -50%); width: 50%; height: 50%; background-color: black; flex-direction: column; justify-content: center; align-items: center">
        <div style="color: white; font-size: 5vh; font-family: Galmuri11, serif; font-weight: 700; margin-bottom: 4vh">대기 중</div>
        <div class="spinner-border text-light" style="width: 10vh; height: 10vh" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <button type="button" class="btn btn-danger run-btn" style="width: 12vw; height: 6vh; margin-top: 6vh; font-family: Galmuri11, serif; font-size: 3vh">도망가기</button>
      </div>
	  `;
  };

  init();
}
