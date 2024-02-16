import { importCss } from "../../utils/importCss.js";
import { navigate } from "../../utils/navigate.js";
import { click } from "../../utils/clickEvent.js";
import { BACKEND, HISTORIES_IMAGE_PATH } from "../../global.js";
import { getCookie } from "../../utils/cookie.js";
import useState from "../../utils/useState.js";

/**
 * 사용자 전적 페이지에 사용하는 header 컴포넌트
 * @param {HTMLElement} $container
 */
export default function MainHeader($container) {
  this.$container = $container;

  const init = () => {
    alert("메인헤더 컴포넌트가 생성되었습니다.");
    fetch(`${BACKEND}/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("jwt")}`,
      },
    }).then((response) => {
      if (response.status === 200) {
        this.$container.textContent = "";
        response.json().then((data) => {
          setUserInfo(data);
        });
        // alert("웹소켓 연결!");
        new WebSocket("wss://localhost/ws/friend_status/");
      } else {
        // TODO => 에러 페이지로 이동
        navigate("/");
      }
    });
  };

  this.render = () => {
    const { nickname, avatar_file_name } = getUserInfo();
    this.$container.insertAdjacentHTML(
      "beforeend",
      `
        <div class="main header-wrapper">
            <div class="main" id="left-side">
                <img src="../../../assets/images/go_back.png" alt="뒤로가기" class="main" id="go-back">
            </div>
            <div class="main" id="title">사십 이 초-월</div>
            <div class="main" id="right-side">
                <div class="main" id="user-info">
                    <span class="main" id="nickname">${nickname}</span>
                    <img src="${HISTORIES_IMAGE_PATH}/avatar/${avatar_file_name}" alt="아바타" id="user-avatar">
                </div>
                <img src="${HISTORIES_IMAGE_PATH}/friends.png" alt="친구 목록" id="friends">
            </div>
        </div>
        `,
    );

    // 뒤로가기 버튼 클릭 이벤트
    click(document.getElementById("go-back"), () => {
      history.back();
    });
    // 사용자 정보 클릭 이벤트
    click(document.getElementById("user-info"), () => {
      navigate("/histories");
    });
    // TODO => 친구 목록 버튼 클릭 이벤트
    click(document.getElementById("friends"), () => {
      // navigate("/friends");
    });
    // 메인 타이틀 클릭 이벤트
    click(document.getElementById("title"), () => {
      navigate("/game-mode");
    });
  };

  importCss("../../../assets/fonts/font.css");
  init();
  let [getUserInfo, setUserInfo] = useState({}, this, "render");
}
