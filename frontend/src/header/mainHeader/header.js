import { importCss } from "../../utils/importCss.js";
import { navigate } from "../../utils/navigate.js";
import { click } from "../../utils/clickEvent.js";
import { BACKEND, HISTORIES_IMAGE_PATH } from "../../global.js";
import { getCookie, deleteCookie } from "../../utils/cookie.js";
import useState from "../../utils/useState.js";
// import friendsInfoModal from "./friends-info-modal.js";

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
    const { nickname, avatar } = getUserInfo();
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
                        <img class="main user-info-element" src="${HISTORIES_IMAGE_PATH}/avatar/${avatar}" alt="아바타" id="user-avatar">
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
    // 친구 목록 버튼 클릭 이벤트
    document.getElementById("friends").addEventListener("click", () => {
      const infoWrapper = document.getElementById("friends-info-wrapper");

      if (infoWrapper.style.display === "grid") {
        infoWrapper.style.display = "none";
      } else {
        infoWrapper.style.display = "grid";
      }

      fetch(`${BACKEND}/friends/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("jwt")}`,
        },
      }).then((response) => {
        if (response.status === 200) {
          // this.$container.textContent = "";
          response.json().then((data) => {
            setFriendsList(data);
          });
          // new WebSocket("wss://localhost/ws/friend_status/");
        } else {
          navigate("/");
        }
      });
    });
    // 메인 타이틀 클릭 이벤트
    click(document.getElementById("title"), () => {
      navigate("/game-mode");
    });
    // click(document.getElementById("lalala"), () => {
    //
    // });
  };

  function createInfoCard(friend, style = {}, image = {}) {
    const { username, avatarImagePath} = friend;
    const borderColor = style.borderColor;
    const imagePath = image.iconImagePath;
    // accept.png 아이콘일 경우에만 추가할 HTML 조각을 정의
    const additionalIconHTML = imagePath === '../../assets/images/accept.png' ?
        `<div>
                <img class="icon" src="../../assets/images/close.png" />
            </div>` : '';
    // 조건에 따라 클래스 추가
    const wrapperClass = imagePath === '../../assets/images/accept.png' ? 'friend-card-wrapper with-additional-icon' : 'friend-card-wrapper';

    return `
        <div class="${wrapperClass}" style="border-color: ${borderColor};">
            <div>
                <img class="avatar-image" src="${avatarImagePath}" />
            </div>
            <div class="user-name">
                ${username}
            </div>
            <div>
                <img class="icon" src="${imagePath}" />
            </div>
            ${additionalIconHTML}
        </div>
    `;
  }

  let renderFriendsInfoModal = (headerElement) => {
    importCss('../../../assets/css/friendsInfoModal.css');
    headerElement.insertAdjacentHTML("beforeend", `
        <div class="friends-info-modal-wrapper" id="friends-info-wrapper">
            <div class="list-wrapper" id="friends-list-wrapper">
                
            </div>
            <div class="list-wrapper" id="user-search-wrapper">
                
            </div>
            <div class="list-wrapper" id="friend-request-list-wrapper">
                
            </div>
        </div>
    `)
  };

  // 받아 올 데이터
  // friends": [
  // {
  //   "nickname": "sejokim",
  //     "is_online": true,
  //     "avatar": "https://example.com/path/to/sejokim_avatar.jpg"
  // }
  this.renderFriendsList = () => {
    // 상태 관리 시스템으로부터 현재 친구 목록 상태를 가져옵니다.
    const newFriendList = getFriendsList();
    console.log(newFriendList);
    // 새로운 친구 목록을 기반으로 친구 카드를 생성합니다.
    const newFriendCards = newFriendList.friends.slice(0, 8).map(card =>
        createInfoCard(card, {borderColor: '#07F7B0'}, {iconImagePath: '../../assets/images/trash.png'})).join('');
    document.getElementById("friends-list-wrapper").innerHTML = `
      <div class="list-subject">
          친구 (${newFriendList.length} / 8)
      </div>
      <div id="friends-list">
          ${newFriendCards}
      </div>
    `;

    // todo->  "is_online": true 라면 그대로, false 라면 투명도를 줘야한다

  };


  importCss("../../../assets/fonts/font.css");
  init();
  let [getUserInfo, setUserInfo] = useState({}, this, "render");
  let [getFriendsList, setFriendsList] = useState({}, this, "renderFriendsList");
  // let [getFoundUserList, setFoundUserList] = useState({}, this, "renderFoundUserList");
}
