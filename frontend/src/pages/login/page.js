import { click } from "../../utils/clickEvent.js";
import { navigate } from "../../utils/navigate.js";
import { getCookie } from "../../utils/cookie.js";
import { BACKEND } from "../../global.js";
/**
 * header 컴포넌트
 * @param {HTMLElement} $container
 */

export default function Login($container) {
  const init = () => {
    if (document.getElementsByTagName("head") !== null) {
      document
        .getElementsByTagName("head")[0]
        .insertAdjacentHTML(
          "beforeend",
          '<link rel="stylesheet" href="../../../assets/css/login.css"/>',
        );
    }
    $container.innerHTML = `
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
    `;
  };

  const addEventListenersToLayout = () => {
    const google = document.getElementById("google");
    const fortyTwo = document.getElementById("forty-two");

    click(google, () => {
      window.location.href = `${BACKEND}/login/google/`;
    });
    click(fortyTwo, () => {
      window.location.href = `${BACKEND}/login/intra42/`;
    });
  };

  const isAlreadyLogin = () => {
    const token = getCookie("jwt");
    if (token === null) return false;
    const requestOption = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // JWT 토큰이 존재하는 경우, Authorization 헤더에 추가합니다
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
    };
    fetch(`${BACKEND}/users/me/`, requestOption)
      .then((response) => {
        if (response.status === 200) {
          navigate("/game-mode");
          return true;
        } else if (response.status === 500) {
          navigate("/error", { errorCode: 500 });
          return true;
        } else {
          alert("알 수 없는 오류");
        }
      })
      .catch((error) => console.error("Error:", error));
    return false;
  };

  if (isAlreadyLogin()) return;

  init();
  addEventListenersToLayout();
}
