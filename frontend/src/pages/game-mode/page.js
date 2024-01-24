import { navigate } from '../../utils/navigate.js';
import { importCss } from '../../utils/importCss.js';
import gameModeUnit from './gameModeUnit.js';
/**
 * @param {HTMLElement} $container
 */
export default function GameMode($container) {
  this.$container = $container;

  this.setState = () => {
    this.render();
  };

  this.render = () => {
    importCss('../../../assets/css/gameMode.css')
    this.$container.innerHTML = `
        <div class="gameMode-container" style="display: flex; justify-content: center; align-items: center; height: 88vh">
            ${gameModeUnit(0)}
            <div class="box" style="height: 65vh; width: 3vw;"></div>
            ${gameModeUnit(1)}
            <div class="box" style="height: 65vh; width: 3vw"></div>
            ${gameModeUnit(2)}
            </div>
        </div>
	  `;
  };

  this.render();
  $container.addEventListener('click', e => {
    if (e.target.id === 'button2') {
      navigate('/');
    }
  });
}
