import { importCss } from '../../utils/importCss.js';
import { navigate } from '../../utils/navigate.js';
/**
 * @param {HTMLElement} $container
 */
export default function Register($container) {
  this.$container = $container;
  this.command = '인증번호를 적어라';
  this.placeholder = '인증번호는 6글자다.';
  this.maxLength = 6;
  this.isValidAuthBtn = true;

  this.setAuthState = () => {
    this.render();
    this.setAuthEvent();
  };

  this.setNicknameState = () => {
    this.command = '별명을 적어라';
    this.placeholder = '최대 8글자 가능하다.';
    this.maxLength = 8;
    this.render();
    // this.setNicknameEvent();
  };

  this.fetchAuthCode = () => {
    const jwtToken = localStorage.getItem('jwtToken');
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // JWT 토큰이 존재하는 경우, Authorization 헤더에 추가합니다
        ...(jwtToken ? { Authorization: 'Bearer ' + jwtToken } : {}),
      },
      // 'code' 변수를 JSON 본문에 포함합니다
      body: JSON.stringify({ code: this.$container.querySelector('#register-form input').value }),
    };


    fetch('https://localhost/api/login/verification-code/', requestOptions)
      .then(response => {
        // 인증코드 잘못된 경우
        if (response.status === 400) {
          alert('잘못된 인증코드');
          return;
        }
        // jwt 토큰 잘못된 경우
        if (response.status === 401) {
          alert('인증이 만료되었습니다. 다시 로그인해주세요.');
          navigate('/'); // 인증되지 않은 사용자는 메인 페이지로 이동
          return;
        }
        if (response.status === 500) {
          console.log(response.json());
          return;
        }
        // 응답을 JSON으로 파싱
        return response.json();
      })
      .then(data => {
        // response.json()이 null이 아닐 때만 아래 로직 실행
        if (data) {
          // token 값을 로컬 스토리지에 저장
          if (data.token) {
            localStorage.setItem('jwtToken', data.token);
          }
          // is_noob 값에 따라 적절한 처리 실행
          if (data.is_noob === true) {
            this.command = '별명을 적어라';
            this.placeholder = '최대 8글자 가능하다.';
            this.maxLength = 8;
            this.setNicknameState();
          } else if (data.is_noob === false) {
            navigate('/game-mode');
          }
          // console.log('Response:', data); // 응답 데이터 처리
        }
      })
      .catch(error => console.error('Error:', error)); // 에러 처리
  };
  ///////////////////////////////////////////////////////////////////////////////////////////////

  this.turnToWarning = warning => {
    this.$container.querySelector('#register-form input').value = '';
    this.$container.querySelector('.white-box').style.borderColor = 'red';
    this.$container.querySelector('.white-box div:last-child').innerHTML = warning;
  };

  this.setAuthEvent = () => {
    const $registerInput = this.$container.querySelector('#register-form input');
    this.$container.querySelector('#register-form').addEventListener('submit', e => {
      e.preventDefault();
      if ($registerInput.value.length !== 6) {
        this.turnToWarning('인증번호는 6글자다.');
        return;
      }
      this.fetchAuthCode();
    });
  };

  this.render = () => {
    importCss('../../../assets/css/register.css');
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
    this.$container
      .querySelector('.register-container')
      .insertAdjacentHTML('beforeend', `<div class="resend-auth-btn">인증코드 재 전송</div>`);

    this.$authBtn = this.$container.querySelector('.resend-auth-btn');
    /*
    ajax 보낼 때 세션 스토리지에 있는 jwt 토큰을 헤더에 담아서 보내야 함
    **/
    this.$authBtn.addEventListener('click', () => {
      if (this.isValidAuthBtn === false) return;
      this.isValidAuthBtn = false;
      this.$authBtn.innerText = '1분 후에 눌러라';

      // JWT 토큰을 가져옵니다 (이미 로그인된 사용자의 경우)
      const jwtToken = localStorage.getItem('jwtToken');

      // 요청 옵션을 설정합니다
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(jwtToken ? { Authorization: 'Bearer ' + jwtToken } : {})
        },
        body: JSON.stringify({ "code": this.$container.querySelector('#register-form input').value })
      };

      // fetch 함수를 사용하여 서버에 요청을 보냅니다
      fetch('https://localhost/api/login/email/', requestOptions)
        .then(response => response.json()) // 응답을 JSON으로 파싱
        .then(data => {
          // 서버로부터 받은 JWT 토큰을 로컬 스토리지에 저장
          if (data && data.token) {
            localStorage.setItem('jwtToken', data.token);
          }
        })
        .catch(error => console.error('Error:', error)); // 에러 처리

      setTimeout(() => {
        this.isValidAuthBtn = true;
        this.$authBtn.innerText = '인증코드 재 전송';
      }, 60000);
    });
  };

  this.setAuthState();
  this.setResendAuthEmailButton();
}
