import { importCss } from '../../utils/importCss.js';
/**
 * @param {HTMLElement} $container
 */
export default function Nickname($container) {
  this.$container = $container;
  this.setState = () => {
    this.render();
  };

  this.render = () => {
    importCss('../../../assets/css/nickname.css')
    this.$container.innerHTML = `
     <div class="nickname-container">
       <div class="title">사십 이 초-월</div>
       <div class="white-box">
         <div class="prompt-text">별명을 적어라</div>
           <form id="nicknameForm">
             <input class="nickname-input" placeholder="최대 8글자 가능하다" maxlength="8">
           </form>
         <div class="error-message"></div>
       </div>
     </div>
	  `;
  };

  this.setState();
  this.$container.querySelector('#nicknameForm').addEventListener('submit', (e) => {
    e.preventDefault();
    this.$container.querySelector('#nicknameForm input').value = '';
    // ajax 로직
    // 유효한 닉네임
    // alert('제출');
    // 유효하지 않은 닉네임
    this.$container.querySelector('.white-box').style.borderColor = 'red';
    this.$container.querySelector('.white-box div:last-child').innerHTML = '이미 존재하는 닉네임이다';
  });
}
