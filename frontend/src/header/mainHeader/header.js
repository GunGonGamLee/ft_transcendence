import { importCss } from "../../utils/importCss.js";
import { navigate } from "../../utils/navigate.js";
import { click } from "../../utils/clickEvent.js";
import { BACKEND, HISTORIES_IMAGE_PATH } from "../../global.js";
import { getCookie, deleteCookie } from "../../utils/cookie.js";
import useState from "../../utils/useState.js";
import friendsInfoModal from "./friends-info-modal.js";

/**
 * 사용자 전적 페이지에 사용하는 header 컴포넌트
 * @param {HTMLElement} $container
 */
export default function MainHeader($container) {
  this.$container = $container;

  const init = () => {
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
                <div class="btn-group">
                    <button class="btn btn-secondary btn-lg dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" id="user-info">
                        <span class="main user-info-element" id="nickname">${nickname}</span>
                        <img class="main user-info-element" src="${HISTORIES_IMAGE_PATH}/avatar/${avatar_file_name}" alt="아바타" id="user-avatar">
                    </button>
                    <ul class="dropdown-menu user-info">
                        <li><div id="go-histories">내 기록 보기</div></li>
                        <li><div id="logout">떠나기</div></li>
                    </ul>
                </div>
                <img src="${HISTORIES_IMAGE_PATH}/friends.png" alt="친구 목록" id="friends">
            </div>
        </div>
        `,

    );
    const headerElement = document.getElementById("header");
    renderFriendsInfoModal(headerElement);

    // 뒤로가기 버튼 클릭 이벤트
    click(document.getElementById("go-back"), () => {
      history.back();
    });
    // 사용자 정보 클릭 이벤트
    click(document.getElementById("go-histories"), () => {
      navigate("/histories");
    });
    // 로그아웃 버튼 클릭 이벤트
    click(document.getElementById("logout"), () => {
      fetch(BACKEND + "/login/logout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("jwt")}`,
        },
      }).then((response) => {
        if (response.status === 200) {
          navigate("/");
          deleteCookie("jwt");
        }
      });
    });
    // TODO => 친구 목록 버튼 클릭 이벤트
    document.getElementById("friends").addEventListener("click", () => {
      const infoWrapper = document.getElementById("friends-info-wrapper");
      if (infoWrapper.style.display === "grid") {
        infoWrapper.style.display = "none";
      } else {
        infoWrapper.style.display = "grid";
      }
    });
    // 메인 타이틀 클릭 이벤트
    click(document.getElementById("title"), () => {
      navigate("/game-mode");
    });
  };

  let renderFriendsInfoModal = (headerElement) => {
    const modalHtml = friendsInfoModal();
    headerElement.insertAdjacentHTML("beforeend", modalHtml);
  };

  importCss("../../../assets/fonts/font.css");
  init();
  let [getUserInfo, setUserInfo] = useState({}, this, "render");
}
