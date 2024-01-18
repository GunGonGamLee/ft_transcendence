import { navigate } from '../../utils/navigate.js';

/**
 * @param {HTMLElement} $container
 */
export default function Nickname($container) {
  this.$container = $container;
  this.errorMessage = '';
  this.setState = () => {
    this.errorMessage = '이미 있다...'
    // this.errorMessage = '최대 8글자 가능하다'
    this.render();
  };

  this.render = () => {
    this.$container.innerHTML = `
    <div style="width: 100vw; height: 88vh; background: #191D40; display: flex; flex-direction: column; align-items: center">
      <div style="text-align: center; color: #FBFF3E; font-size: 64px; font-family: Galmuri11, serif; font-weight: 700;">사십 이 초-월</div>
      <div style="display: flex; flex-direction: column; align-items: center; margin-top: 10vh; width: 45vw; height: 50vh; background-color: #191D40; border: 2px solid white">
        <div style="margin-top: 10vh; text-align: center; color: white; font-size: 60px; font-family: Galmuri11, serif;">별명을 적어라</div>
        <input style="margin-top: 5vh; text-align: center; font-family: Galmuri11, serif; font-size: 45px; height: 10vh; width: 30vw" placeholder="최대 8글자 가능하다">
        <div style="margin-top: 3vh; text-align: center; color: red; font-size: 20px; font-family: Galmuri11-Bold, serif;">${this.errorMessage}</div>
      </div>
    </div>
	  `;
  };

  this.setState();
  $container.addEventListener('click', e => {
    if (e.target.id === 'button1') {
      navigate('/gamemode');
    }
  });
}
