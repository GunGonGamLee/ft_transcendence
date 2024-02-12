import { importCss } from "../../utils/importCss.js";
import gameModeUnit from "./gameModeUnit.js";
/**
 * @param {HTMLElement} $container
 */

export default function GameMode($container) {
  this.$container = $container;

  this.render = () => {
    importCss("../../../assets/css/game-mode.css");
    this.$container.innerHTML = `
        <div class="game-mode-container">
          ${gameModeUnit(0)}
          ${gameModeUnit(1)}
          ${gameModeUnit(2)}
          <div class="alert alert-primary" role="alert">
  A simple primary alert—check it out!
</div>
        </div>
	  `;
  };

  this.render();
}
