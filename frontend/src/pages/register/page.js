import { importCss } from "../../utils/importCss.js";
import { navigate } from "../../utils/navigate.js";
import useState from "../../utils/useState.js";
import { BACKEND } from "../../global.js";
import { getCookie } from "../../utils/cookie.js";
/**
 * @param {HTMLElement} $container
 */
export default function Register($container) {
  let isValidAuthBtn = true;
  let authStateInput = {
    command: "인증번호를 적어라",
    placeholder: "인증번호는 6글자다.",
    maxLength: 6,
    pattern: "^[A-Za-z0-9]+$",
  };

  let [getAuthState, setAuthState] = useState(authStateInput, this, "render");
  const init = () => {
    this.render();
    setAuthEvent();
    setResendAuthEmailButton();
  };

  this.render = () => {
    importCss("../../../assets/css/register.css");
    $container.innerHTML = `
     <div class="register-container">
       <div class="title">사십 이 초-월</div>
       <div class="white-box">
         <div class="prompt-text">${getAuthState().command}</div>
           <form id="register-form">
             <input class="register-input" placeholder="${getAuthState().placeholder}" maxlength="${getAuthState().maxLength}" pattern="${getAuthState().pattern}">
           </form>
         <div class="error-message"></div>
       </div>
     </div>
    `;
  };

  const setNicknameState = () => {
    let nicknameStateInput = {
      command: "별명을 적어라",
      placeholder: "최대 8글자 가능하다.",
      maxLength: 8,
      pattern: "^[가-힣]{1,8}$",
    };
    setAuthState(nicknameStateInput);
    setNicknameEvent();
  };
  /**
   * @description request option을 반환합니다.
   * @param {string} jwt
   * @param {string} key
   * @returns {RequestInit | undefined}
   */
  const getRequestOptions = (jwt, key) => {
    return {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        // JWT 토큰이 존재하는 경우, Authorization 헤더에 추가합니다
        ...(jwt ? { Authorization: "Bearer " + jwt } : {}),
      },
      // 'code' 변수를 JSON 본문에 포함합니다
      body: JSON.stringify({
        [key]: $container.querySelector("#register-form input").value,
      }),
    };
  };

  const fetchAuthCode = () => {
    const jwtToken = getCookie("jwt");
    fetch(
      `${BACKEND}/login/verification-code/`,
      getRequestOptions(jwtToken, "code"),
    )
      .then((response) => {
        // 인증코드 잘못된 경우
        if (response.status === 400) {
          alert("잘못된 인증코드");
          return;
        }
        // jwt 토큰 잘못된 경우
        if (response.status === 401) {
          alert("인증이 만료되었습니다. 다시 로그인해주세요.");
          navigate("/");
          return;
        }
        if (response.status === 500) {
          navigate("error", 500);
          return;
        }
        if (response.status === 404) {
          alert("500");
          navigate("/");
          return;
        }
        // 응답을 JSON으로 파싱
        return response.json();
      })
      .then((data) => {
        // response.json()이 null이 아닐 때만 아래 로직 실행
        console.log(data);
        if (data) {
          // token 값을 로컬 스토리지에 저장
          if (data.token) {
            localStorage.setItem("jwtToken", data.token);
          }
          // is_noob 값에 따라 적절한 처리 실행
          if (data.is_noob === "True") {
            setNicknameState();
          } else {
            navigate("/game-mode");
          }
          // console.log('Response:', data); // 응답 데이터 처리
        }
      })
      .catch((error) => console.error("Error:", error)); // 에러 처리
  };

  const fetchNickname = () => {
    const jwtToken = localStorage.getItem("jwtToken");
    fetch(
      `${BACKEND}/users/nickname/`,
      getRequestOptions(jwtToken, "nickname"),
    )
      .then((response) => {
        // 인증코드 잘못된 경우
        if (response.status === 201) {
          navigate("/game-mode");
          return;
        }
        if (response.status === 400) {
          turnToWarning("이미 있다....");
          return;
        }
        // jwt 토큰 잘못된 경우
        if (response.status === 401) {
          alert("401");
          return;
        }
        if (response.status === 404) {
          alert("404");
          return;
        }
        if (response.status === 500) {
          navigate("error", 500);
          return;
        }
        // 응답을 JSON으로 파싱
        return response.json();
      })
      .catch((error) => console.error("Error:", error)); // 에러 처리
  };

  const turnToWarning = (warning) => {
    $container.querySelector("#register-form input").value = "";
    $container.querySelector(".white-box").style.borderColor = "red";
    $container.querySelector(".white-box div:last-child").innerHTML =
      warning;
  };

  const setAuthEvent = () => {
    const $registerInput = $container.querySelector(
      "#register-form input",
    );
    $container
      .querySelector("#register-form")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        if ($registerInput.value.length !== 6) {
          turnToWarning("인증번호는 6글자다.");
          return;
        }
        fetchAuthCode();
      });
  };

  const setNicknameEvent = () => {
    $container
      .querySelector("#register-form")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        fetchNickname();
      });
  };

  const setResendAuthEmailButton = () => {
    $container
      .querySelector(".register-container")
      .insertAdjacentHTML(
        "beforeend",
        `<div class="resend-auth-btn">인증코드 재 전송</div>`,
      );

    const $authBtn = $container.querySelector(".resend-auth-btn");

    $authBtn.addEventListener("click", () => {
      if (isValidAuthBtn === false) return;
      isValidAuthBtn = false;
      $authBtn.innerText = "1분 후에 눌러라";

      // fetch 함수를 사용하여 서버에 요청을 보냅니다
      const jwtToken = localStorage.getItem("jwtToken");
      fetch(`${BACKEND}/login/email/`, getRequestOptions(jwtToken, "code"))
        .then((response) => response.json()) // 응답을 JSON으로 파싱
        .then((data) => {
          // 서버로부터 받은 JWT 토큰을 로컬 스토리지에 저장
          if (data && data.token) {
            localStorage.setItem("jwtToken", data.token);
          }
        })
        .catch((error) => console.error("Error:", error)); // 에러 처리

      setTimeout(() => {
        isValidAuthBtn = true;
        $authBtn.innerText = "인증코드 재 전송";
      }, 60000);
    });
  };

  init();
}
