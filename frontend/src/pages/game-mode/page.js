import { importCss } from "../../utils/importCss.js";
// import gameModeUnit from "./gameModeUnit.js";
import {click} from "../../utils/clickEvent.js";
import {navigate} from "../../utils/navigate.js";
/**
 * @param {HTMLElement} $container
 */

export default function GameMode($container) {
  const init = () => {
    render();
    click($container.querySelector(".er"), () => {
      navigate("/errorPage", 9999);
    });
  }

  const render = () => {
    importCss("../../../assets/css/game-mode.css");
    $container.innerHTML = `
      <div class="game-mode-container">
        <button type="button" class="btn btn-primary er">go to errorPage</button>
      </div>
	  `;
  };

  init();
}
