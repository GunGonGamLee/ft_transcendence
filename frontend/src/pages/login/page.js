import {click} from "../../utils/clickEvent.js";

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
          fetch('http://localhost:8000/api/login/google')
          .then(response => response.json())
          .then(data => {
              window.location.href = data.url;
          })
          .catch(error => console.error('google login error:', error));
        });
        click(fortyTwo, () => {
          fetch('http://localhost:8000/api/login/intra42')
          .then(response => response.json())
          .then(data => {
              window.location.href = data.url;
          })
          .catch(error => console.error('intra42 login error:', error));
        });
    }

    this.render();
    this.addEventListenersToLayout();
}