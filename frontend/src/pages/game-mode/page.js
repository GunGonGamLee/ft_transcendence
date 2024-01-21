import { navigate } from '../../utils/navigate.js';
import { importCss } from '../../utils/importCss.js';

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
    <button id="button2">go to home</button>
	  `;
  };

  this.render();
  $container.addEventListener('click', e => {
    if (e.target.id === 'button2') {
      navigate('/');
    }
  });
}
