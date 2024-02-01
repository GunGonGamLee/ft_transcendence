import { importCss } from "../../utils/importCss.js";
import gameModeUnit from "./gameModeUnit.js";
import useState from "../../utils/useState.js";
/**
 * @param {HTMLElement} $container
 */

export default function GameMode($container) {
  this.$container = $container;
  let [getGameMode, setGameMode] = useState(0, this, "render");
  this.setState = () => {
    this.render();
  };

  this.render = () => {
    importCss("../../../assets/css/game-mode.css");
    this.$container.innerHTML = `
        <div class="game-mode-container">
          ${gameModeUnit(getGameMode())}
          ${gameModeUnit(getGameMode())}
          ${gameModeUnit(getGameMode())}
          <button id="button2" style="position: absolute; bottom: 10px; right: 10px;">state</button>
        </div>
	  `;
  };

  this.render();
  $container.addEventListener("click", (e) => {
    if (e.target.id === "button2") {
      setGameMode(getGameMode() + 1);
    }
  });
}
