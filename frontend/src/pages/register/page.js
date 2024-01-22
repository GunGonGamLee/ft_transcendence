import { importCss } from '../../utils/importCss.js';
/**
 * @param {HTMLElement} $container
 */
export default function Register($container) {
  this.$container = $container;
  this.command = "인증번호를 적어라";
  this.placeholder = "인증번호는 6글자다."
  this.warning = "넌 누구냐...";
  this.maxLength = 6;
  this.isValidAuthBtn = true;

  this.setState = () => {
    this.render();
    this.setEvent();
  };

  this.setEvent = () => {
    this.$container.querySelector('#register-form').addEventListener('submit', (e) => {
      e.preventDefault();
      // ajax보내서 성공 코드 오면
      if (this.$container.querySelector('#register-form input').value.length === this.maxLength) {
        // 닉네임 생성도 성공코드 오면
        // navigate(게임선택페이지)
        this.command = "별명을 적어라";
        this.placeholder = "최대 8글자 가능하다."
        this.warning = "이미 있다...";
        this.maxLength = 8;
        this.setState();
      } else { // 잘못되면
        this.$container.querySelector('#register-form input').value = '';
        this.$container.querySelector('.white-box').style.borderColor = 'red';
        this.$container.querySelector('.white-box div:last-child').innerHTML = `${this.warning}`;
      }
    });
  }

  this.render = () => {
    importCss('../../../assets/css/register.css')
    this.$container.innerHTML = `
     <div class="register-container">
       <div class="title">사십 이 초-월</div>
       <div class="white-box">
         <div class="prompt-text">${this.command}</div>
           <form id="register-form">
             <input class="register-input" placeholder="${this.placeholder}" maxlength="${this.maxLength}">
           </form>
         <div class="error-message"></div>
       </div>
     </div>
	  `;
  };
  this.setResendAuthEmailButton = () => {
    this.$container.querySelector('.register-container').insertAdjacentHTML('beforeend',`<div class="resend-auth-btn">재 전송이 필요하면 눌러라</div>`,
      "beforeend")

    this.$authBtn = this.$container.querySelector('.resend-auth-btn');

    this.$authBtn.addEventListener('click', ()=> {
      if (this.isValidAuthBtn === false)
        return ;
      this.isValidAuthBtn = false;
      this.$authBtn.innerText = "1분 후에 눌러라";
      // ajax 로직 추가
      setTimeout(() => {
        this.isValidAuthBtn = true;
        this.$authBtn.innerText = "재 전송이 필요하면 눌러라";
      }, 60000);
    })
  }
  this.setState();
  this.setResendAuthEmailButton();
}
