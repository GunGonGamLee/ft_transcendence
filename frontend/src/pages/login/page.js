import {click} from "../../utils/clickEvent.js";
import { navigate } from "../../utils/navigate.js";

/**
 * header 컴포넌트
 * @param {HTMLElement} $container
 */

export default function Login($container) {
    this.$container = $container;

    this.setState = () => {
        this.render();
    }

    this.render = () => {
        this.renderLayout();
    }

    this.renderLayout = () => {
        if (document.getElementsByTagName("head") !== null) {
            document.getElementsByTagName("head")[0].insertAdjacentHTML(
                "beforeend",
                '<link rel="stylesheet" href="../../../assets/css/login.css"/>'
            );
        }
        this.$container.innerHTML = `
        <div class="login-wrapper">
        <div class="container">
        <div class="arcade-machine">
          <div class="shadow"></div>
          <div class="top">
            <h1>FT_TRANCENDENCE</h1>
          </div>
          <div class="screen-container">
            <div class="shadow"></div>
            <div class="screen">
              <div class="screen-display">
              </div>
              <h2 id="google">Google Login</h2>
              <h2 id="forty-two">42 Login</h2>
              <div class="alien-container">
                <div class="alien">
                  <div class="ear ear-left"></div>
                  <div class="ear ear-right"></div>
                  <div class="head-top"></div>
                  <div class="head">
                    <div class="eye eye-left"></div>
                    <div class="eye eye-right"></div>
                  </div>
                  <div class="body"></div>
                  <div class="arm arm-left"></div>
                  <div class="arm arm-right"></div>
                </div>
              </div>
            </div>
            <div class="joystick">
              <div class="stick"></div>
            </div>
          </div>
          <div class="board">
            <div class="button button-a"></div>
            <div class="button button-b"></div>
            <div class="button button-c"></div>
          </div>
          <div class="bottom">
            <div class="stripes"></div>
          </div>
        </div>
      </div>
      </div>
    `
    }

    this.addEventListenersToLayout = () => {
        const google = document.getElementById("google");
        const fortyTwo = document.getElementById("forty-two");
        
        click(google, () => {
          fetch('https://localhost:8000/api/login/google')
          .then(response => {
            if (response.status === 200) { // 성공 코드를 확인합니다.
              return response.json();
            } else {
              throw new Error('Google login failed');
            }
          })
          .then(data => {
            localStorage.setItem('jwt', data.token); // JWT 토큰을 저장합니다.
            navigate('/register'); // 특정 페이지로 이동합니다.
          })
          .catch(error => console.error('Google login error:', error));
        });
    
        click(fortyTwo, () => {
          fetch('http://localhost:8000/api/login/intra42')
          .then(response => {
            if (response.status === 200) { // 성공 코드를 확인합니다.
              return response.json();
            } else {
              throw new Error('Intra42 login failed');
            }
          })
          .then(data => {
            localStorage.setItem('jwt', data.token); // JWT 토큰을 저장합니다.
            navigate('/register'); // 특정 페이지로 이동합니다.
          })
          .catch(error => console.error('Intra42 login error:', error));
        });
    }

    this.render();
    this.addEventListenersToLayout();
}