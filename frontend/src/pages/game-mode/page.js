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
    importCss('../../../assets/css/game-mode.css')
    this.$container.innerHTML = `
        <div class="game-mode-container">
        ${gameModeUnit(0)}
        <div class="spacer"></div>
        ${gameModeUnit(1)}
        <div class="spacer"></div>
        ${gameModeUnit(2)}
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
