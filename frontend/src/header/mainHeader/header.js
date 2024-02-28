import { importCss } from "../../utils/importCss.js";
import { navigate } from "../../utils/navigate.js";
import { click } from "../../utils/clickEvent.js";
import { BACKEND, WEBSOCKET, HISTORIES_IMAGE_PATH } from "../../global.js";
import { getCookie, deleteCookie } from "../../utils/cookie.js";
import useState from "../../utils/useState.js";

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
        this.ws = new WebSocket(`${WEBSOCKET}/friend_status/`);
        this.ws.onmessage = (msg) => {
          let response = JSON.parse(msg.data);
          // TODO: 중복로그인 임시로 풀어둠
          // if (response.type === 'alreadyLogin') {
          //   console.log(response.message);
          //   this.ws.close();
          //   navigate("error", { errorCode: 4001 });
          //   return;
          // }

          // 업데이트된 내용을 set 함수에 전달합니다.
          setFriendsList(response.data);
          setRequestersList(response.data);
        };
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
    // 친구 목록 버튼 클릭 이벤트 (모달 보이기, 친구목록 요청, 친구요청 리스트 요청)
    click(document.getElementById("friends"), () => {
      const infoWrapper = document.getElementById("friends-info-wrapper");

      if (infoWrapper.style.display === "grid") {
        infoWrapper.style.display = "none";
      } else {
        infoWrapper.style.display = "grid";
      }
    });
    // 유저찾기 검색 이벤트
    findUserEvent();

    // 메인 타이틀 클릭 이벤트
    click(document.getElementById("title"), () => {
      navigate("/game-mode");
    });
  };

  function createInfoCard(friend, index, style = {}, image = {}) {
    const { nickname, avatar, is_online } = friend;
    // 아바타 이미지 경로 조정
    const avatarImagePath = `../../assets/images/avatar/${avatar}`;
    const borderColor = style.borderColor;
    const imagePath = image.iconImagePath;

    // `is_online`이 false일 경우 카드에 적용할 투명도 스타일
    const opacityStyle = is_online ? "" : "opacity: 0.5;";

    // accept.png 아이콘일 경우에만 추가할 HTML 조각을 정의하고 reject-icon에도 인덱스 적용
    const additionalIconHTML =
      imagePath === "../../assets/images/accept.png"
        ? `<div>
            <img class="icon" id='reject-icon-${index}' src="../../assets/images/close.png" />
        </div>`
        : "";

    // 조건에 따라 클래스 추가
    const wrapperClass =
      imagePath === "../../assets/images/accept.png"
        ? "friend-card-wrapper with-additional-icon"
        : "friend-card-wrapper";

    // 이미지 이름에 따른 id 속성 값 설정
    let iconIdSuffix;
    if (imagePath === "../../assets/images/accept.png") {
      iconIdSuffix = "accept-icon-";
    } else if (imagePath === "../../assets/images/paper_plane.png") {
      iconIdSuffix = "request-icon-";
    } else if (imagePath === "../../assets/images/trash.png") {
      iconIdSuffix = "delete-icon-";
    } else {
      iconIdSuffix = "icon-"; // 기본 값
    }

    return `
        <div class="${wrapperClass}" style="border-color: ${borderColor}; ${opacityStyle}">
            <div>
                <img class="avatar-image" src="${avatarImagePath}" />
            </div>
            <div class="user-name">
                ${nickname}
            </div>
            <div>
                <img class="icon" id='${iconIdSuffix}${index}' src="${imagePath}" />
            </div>
            ${additionalIconHTML}
        </div>
        `;
  }

  let findUserEvent = () => {
    // 유저찾기 검색 이벤트
    document
      .getElementById("input")
      .addEventListener("input", function (event) {
        const nickname = event.target.value;

        // 유저찾기 input을 비웠을 땐 리스트도 비워줘야함
        if (nickname === "") {
          document.getElementById("user-search").innerHTML = "";
        }
        fetch(
          `${BACKEND}/friends/search/?nickname=${encodeURIComponent(nickname)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getCookie("jwt")}`,
            },
          },
        ).then((response) => {
          if (response.status === 200) {
            response.json().then((data) => {
              setSearchedUserList(data);
            });
          } else {
            setSearchedUserList(null);
          }
        });
      });
  };

  let renderFriendsInfoModal = (headerElement) => {
    importCss("../../../assets/css/friendsInfoModal.css");
    headerElement.insertAdjacentHTML(
      "beforeend",
      `
        <div class="friends-info-modal-wrapper" id="friends-info-wrapper">
            <div class="list-wrapper" id="friends-list-wrapper">
                <div class="list-subject">
                    친구 (0)
                </div>
                <div id="friends-list">
                    <div style="position: relative; width: 100%; height: 100%;">
                        <div id="loading-spinner" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">               
                            <div class="spinner-border text-light" style="width: 10vh; height: 10vh;" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="list-wrapper" id="user-search-wrapper">
                <div class="list-subject">
                    유저 찾기
                </div>
                <div id="search-form">
                    <image src="../../assets/images/search.png"></image>
                    <input id="input" />
                </div>
                <div id="user-search-list">
                    
                </div>
            </div>
            <div class="list-wrapper" id="friend-request-list-wrapper">
                <div class="list-subject">
                    친구 요청 (0)
                </div>
                <div id="friend-request-list">
                    <div style="position: relative; width: 100%; height: 100%;">
                        <div id="loading-spinner" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">               
                            <div class="spinner-border text-light" style="width: 10vh; height: 10vh;" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    );
  };

  this.renderFriendsList = () => {
    // 상태 관리 시스템으로부터 현재 친구 목록 상태를 가져옵니다.
    const newFriendList = getFriendsList();
    // 새로운 친구 목록을 기반으로 친구 카드를 생성합니다.
    const newFriendCards = newFriendList.friends
      .slice(0, 8)
      .map((card, index) =>
        createInfoCard(
          card,
          index,
          { borderColor: "#07F7B0" },
          { iconImagePath: "../../assets/images/trash.png" },
        ),
      )
      .join("");

    document.getElementById("friends-list-wrapper").innerHTML = `
          <div class="list-subject">
            친구 (${newFriendList.friends.length} / 8)
            </div>
            <div id="friends-list">
                ${newFriendCards}
            </div>
                `;

    // 친구삭제 클릭 이벤트
    newFriendList.friends.forEach((friend, index) => {
      const iconElement = document.getElementById(`delete-icon-${index}`);

      if (iconElement) {
        iconElement.addEventListener("click", () => {
          // nickname 키값 구성
          const nickname = friend.nickname;

          fetch(`${BACKEND}/friends/`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getCookie("jwt")}`,
            },
            body: JSON.stringify({ nickname }),
          }).then((response) => {
            if (response.status === 200) {
              const loadingHtml = `
                                <div style="position: relative; width: 100%; height: 100%;">
                                    <div id="loading-spinner" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">               
                                        <div class="spinner-border text-light" style="width: 10vh; height: 10vh;" role="status">
                                        </div>
                                    </div>
                                </div>
                            `;
              const friendsListDiv = document.getElementById("friends-list");
              friendsListDiv.innerHTML = loadingHtml; // 로딩 스피너를 friends-list 내부에 갱신
            } else {
              // TODO => 에러 페이지로 이동
              navigate("/");
            }
          });
        });
      }
    });
    click(document.getElementById("friends-list"), () => {
      const loadingHtml = `
                                <div style="position: relative; width: 100%; height: 100%;">
                                    <div id="loading-spinner" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">               
                                        <div class="spinner-border text-light" style="width: 10vh; height: 10vh;" role="status">
                                        </div>
                                    </div>
                                </div>
                            `;
      const friendsListDiv = document.getElementById("friends-list");
      friendsListDiv.innerHTML = loadingHtml; // 로딩 스피너를 friends-list 내부에 갱신
    });
  };

  // 친구요청 받은 리스트 렌더링 함수
  this.renderRequestersList = () => {
    const newRequestersList = getRequestersList();

    // 친구 요청 카드 생성 (accept 아이콘만 포함되어 있음, reject 아이콘 처리는 가정하에 추가)
    const newRequestersCards = newRequestersList.friendRequestList
      .map((card, index) =>
        createInfoCard(
          card,
          index,
          { borderColor: "#29ABE2" },
          { iconImagePath: "../../assets/images/accept.png" },
        ),
      )
      .join("");

    document.getElementById("friend-request-list-wrapper").innerHTML = `
          <div class="list-subject">
              친구 요청 (${newRequestersList.friendRequestList.length})
          </div>
          <div id="friend-request-list">
              ${newRequestersCards}
          </div>
        `;

    // 공통 요청 처리 함수
    function handleFriendRequest(action, nickname) {
      fetch(`${BACKEND}/friends/${action}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("jwt")}`,
        },
        body: JSON.stringify({ nickname }),
      })
        .then((response) => {
          if (response.status === 200) {
            const loadingHtml = `
                                <div style="position: relative; width: 100%; height: 100%;">
                                    <div id="loading-spinner" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                                        <div class="spinner-border text-light" style="width: 10vh; height: 10vh;" role="status">
                                        </div>
                                    </div>
                                </div>
                            `;
            const friendsListDiv = document.getElementById(
              "friend-request-list",
            );
            friendsListDiv.innerHTML = loadingHtml; // 로딩 스피너를 friend-request-list 내부에 갱신
          } else {
            navigate("/");
          }
          // 성공적으로 처리됐을 때의 로직 (예: 리스트 갱신, 알림 등)
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }

    // 각 요청자에 대한 이벤트 리스너 설정
    newRequestersList.friendRequestList.forEach((requester, index) => {
      const acceptIcon = document.getElementById(`accept-icon-${index}`);
      const rejectIcon = document.getElementById(`reject-icon-${index}`);

      if (acceptIcon) {
        acceptIcon.addEventListener("click", () =>
          handleFriendRequest("accept", requester.nickname),
        );
      }
      if (rejectIcon) {
        rejectIcon.addEventListener("click", () =>
          handleFriendRequest("reject", requester.nickname),
        );
      }
    });
  };

  // 유저검색 리스트 렌더링
  this.renderSearchedUserList = () => {
    const newSearchedUserList = getSearchedUserList();

    const newSearchedUserCards = newSearchedUserList.searchedUserList
      .map((card, index) =>
        createInfoCard(
          card,
          index,
          { borderColor: "#FF52A0" },
          { iconImagePath: "../../assets/images/paper_plane.png" },
        ),
      )
      .join("");

    document.getElementById("user-search-list").innerHTML = `
            <div id="user-search">
                ${newSearchedUserCards}
            </div>
        `;

    newSearchedUserList.searchedUserList.forEach((user, index) => {
      const iconElement = document.getElementById(`request-icon-${index}`);

      if (iconElement) {
        iconElement.addEventListener("click", () => {
          const nickname = user.nickname;

          fetch(`${BACKEND}/friends/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getCookie("jwt")}`,
            },
            body: JSON.stringify({ nickname }),
          }).then((response) => {
            if (response.status === 200) {
            } else {
              navigate("/");
            }
          });
        });
      }
    });
  };

  importCss("../../../assets/fonts/font.css");
  let [getUserInfo, setUserInfo] = useState({}, this, "render");
  let [getFriendsList, setFriendsList] = useState(
    {},
    this,
    "renderFriendsList",
  );
  let [getRequestersList, setRequestersList] = useState(
    {},
    this,
    "renderRequestersList",
  );
  let [getSearchedUserList, setSearchedUserList] = useState(
    {},
    this,
    "renderSearchedUserList",
  );
  init();
}
