import { importCss } from "../../utils/importCss.js";
import gameModeUnit from "./gameModeUnit.js";
/**
 * @param {HTMLElement} $container
 */

export default function GameMode($container) {
  this.$container = $container;
  this.setState = () => {
    this.render();
  };

  this.render = () => {
    importCss("../../../assets/css/game-mode.css");
    this.$container.innerHTML = `
        <div class="game-mode-container">
          ${gameModeUnit(0)}
          ${gameModeUnit(1)}
          ${gameModeUnit(2)}
        </div>
	  `;
  };

  this.render();
}
