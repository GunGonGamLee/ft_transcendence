import { click } from "../../utils/clickEvent.js";
import { importCss } from "../../utils/importCss.js";
import roomCreateModal from "./room-create-modal.js";
import { hoverToggle } from "../../utils/hoverEvent.js";
import passwordModal from "./password-modal.js";
import useState from "../../utils/useState.js";
import gameRoomList from "./gameRoomlist.js";
import { BACKEND } from "../../global.js";
import { navigate } from "../../utils/navigate.js";

export default function CustomGameList($container) {
  let mode = 2; // 0: 1 vs 1, 1: 토너먼트, 2: 전체, defulat=2
  let pagination = 1;
  let maxPage = 1;

  const init = () => {
    renderLayout();
    this.renderGameRoomList();
  };

  const renderLayout = () => {
    importCss("../../../assets/css/customGameList.css");

    $container.innerHTML = `
      <div class="custom-game-list" id="content-wrapper">
          <div class="custom-game-list" id="game-room-list-wrapper">
			<div class="game-room-list" id="list-wrapper"></div>
          </div>
          <div class="custom-game-list" id="pagination-arrow-wrapper">
              <div class="custom-game-list" id="pagination-arrow-left" style="color: rgb(255, 255, 255); font-family: Galmuri11, serif;">
                  <
              </div>
              <div class="custom-game-list" id="pagination-arrow-right" style="color: rgb(255, 255, 255); font-family: Galmuri11, serif;" role="button" >
                  >
              </div>
          </div>
      </div>
      <footer class="custom-game-list" id="game-room-options-wrapper">
        <div class="custom-game-list" id="quick-join" style="color: rgb(255, 255, 255); font-family: Galmuri11, serif;">신속히 입장</div>
        <div class="custom-game-list" id="create-room" style="color: rgb(255, 255, 255); font-family: Galmuri11, serif;">방 만들기</div>
        <div class="custom-game-list" id="room-filter" style="color: rgb(255, 255, 255); font-family: Galmuri11, serif;">
            <div class="histories game-mode-toggle" id="toggle">
                <ul class="histories">
                    <li id="1vs1-filter-btn" style="color: yellow" >1 vs 1 모드</li>
                    <li id="tournament-filter-btn" style="color: yellow;">토너먼트 모드</li>
                </ul>
            </div>
            <div class="custom-game-list" id="room-filter">
                방 걸러보기
            </div> 
        </div>
      </footer>
			${roomCreateModal()}
			${passwordModal()}
        `;
  };
  /**
   * 사용자 지정 게임 방의 게임 방 리스트를 렌더링합니다.
   * @description $listWrapper {HTMLElement} 게임 방 리스트를 렌더링할 <div> 엘리먼트
   */
  this.renderGameRoomList = () => {
    let $listWrapper = $container.querySelector("#list-wrapper");
    // $listWrapper.innerHTML = "";
    if ($listWrapper == null) return;
    $listWrapper.textContent = "";
    let curGameRoomList = getGameRoomList().data;
    if (curGameRoomList == null) {
      $listWrapper.insertAdjacentHTML(
        "afterbegin",
        `
              <div style="position: absolute; top: 40vh; left: 40vw;">               
               <div class="spinner-border text-light" style="width: 10vh; height: 10vh" role="status">
                  <span class="visually-hidden">Loading...</span>
               </div>
               <span>Fetching data....</span>
              </div> 
            `,
      );
    } else {
      curGameRoomList.forEach((data) => {
        $listWrapper.insertAdjacentHTML(
          "afterbegin",
          `<div class="game-room-list room-wrapper room-id-${data.id}">
                  ${gameRoomList(data)}
                </div>`,
        );
        click($listWrapper.querySelector(`.room-id-${data.id}`), () => {
          if (data.started === true) {
            alert("게임이 이미 시작되었습니다.");
            return;
          }
          if (
            (data.player_num === 4 && data.mode === 1) ||
            (data.player_num === 2 && data.mode === 0)
          ) {
            alert("방이 꽉 찼습니다.");
            return;
          }

          if (data.is_secret === true) {
            document.getElementById("password-modal-wrapper").style.display =
              "block";
            document.getElementById("pwd-input").focus();
            document
              .getElementById("pwd-input")
              .addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                  enterRoom(data.id, e.target.value);
                }
              });
          } else {
            enterRoom(data.id);
          }
        });
      });
    }
  };

  const enterRoom = (id, password = null) => {
    let wss;

    if (password != null)
      wss = new WebSocket(
        `wss://localhost:443/ws/games/${id}/?password=${password}`,
      );
    else wss = new WebSocket(`wss://localhost:443/ws/games/${id}/`);

    wss.onmessage = (event) => {
      const res = JSON.parse(event.data);
      if (res.error) {
        if (res.error === "[PermissionDenied] can't access")
          alert("비밀번호가 틀렸습니다.");
        return;
      }
      res.socket = wss;
      if (password != null) res.password = password;
      wss.onmessage = null;
      navigate("/waiting-room", res);
    };
  };

  const addEventListenersToLayout = () => {
    // querySelectorAll로 룸 리스트 각각의 요소들을 담은 변수
    // const $roomContents = document.querySelectorAll(
    //   ".game-room-list.room-info",
    // );
    // 아직 사용하지는 않았지만 페이지네이션 오른쪽, 왼쪽 요소를 담고 있는 변수
    const $paginationBefore = document.getElementById("pagination-arrow-left");
    const $paginationAfter = document.getElementById("pagination-arrow-right");
    // 방만들기 버튼 요소
    const $createRoomButton = document.getElementById("create-room");
    // 방만들기 모달 요소
    const $roomCreateModal = document.getElementById(
      "room-create-modal-wrapper",
    );
    // 방만들기 모달 닫기 아이콘
    const $roomCreateModalClose = document.getElementById(
      "room-create-modal-close",
    );
    // 걸러보기 아이콘
    const $roomSearchFilter = document.getElementById("room-filter");
    // 걸러보기 토글
    const $modeFilterToggle = document.getElementById("toggle");
    // 패스워드 모달 요소
    const $passwordModal = document.getElementById("password-modal-wrapper");
    // 패스워드 모달 닫기 아이콘
    const $passwordModalClose = document.getElementById("password-modal-close");

    // 방만들기 모달 열기
    click($createRoomButton, () => {
      $roomCreateModal.style.display = "block";
    });

    // 방만들기 모달 닫기
    click($roomCreateModalClose, () => {
      $roomCreateModal.style.display = "none";
    });

    // 방 걸러보기 토글
    hoverToggle($roomSearchFilter, $modeFilterToggle, "block");

    // // 대기중 && 자물쇠가 걸려있는 방 일때 패스워드 모달 열기
    // // roomContant에 마우스가 들어갈 떄 hover event 적용
    // $roomContents.forEach(($roomContent) => {
    //   click($roomContent, () => {
    //     const $roomWrapper = $roomContent.closest(".room-wrapper");
    //
    //     // isSecret: '.is-secret' 클래스를 가진 요소의 존재 여부로 비밀방인지 판단
    //     const isSecret = $roomWrapper.querySelector(".is-secret") !== null;
    //
    //     // isWaiting: roomStatus 요소의 텍스트 내용으로 '대기중'인지 판단
    //     const roomStatusElement = $roomWrapper.querySelector(".room-status");
    //     const isWaiting =
    //       roomStatusElement &&
    //       roomStatusElement.textContent.trim() === "대기중";
    //
    //     // 비밀방이며 대기중인 경우, 패스워드 모달을 표시
    //     if (isSecret && isWaiting) {
    //       $passwordModal.style.display = "block";
    //     }
    //   });
    //
    //   // mouseenter 이벤트 리스너
    //   $roomContent.addEventListener("mouseenter", function () {
    //     const style = window.getComputedStyle(this);
    //     const borderColor = style.borderColor;
    //
    //     // RGB 색상에서 RGBA 색상으로 변환하여 배경색으로 설정 (20% 투명도 적용)
    //     const backgroundColor = borderColor
    //       .replace("rgb", "rgba")
    //       .replace(")", ", 0.2)");
    //
    //     // 수정된 부분: 요소의 style 속성에 직접 backgroundColor 설정
    //     this.style.backgroundColor = backgroundColor;
    //   });
    //
    //   // mouseleave 이벤트 리스너
    //   $roomContent.addEventListener("mouseleave", function () {
    //     // 배경색을 원래 상태(투명)로 되돌림
    //     this.style.backgroundColor = ""; // 또는 초기 설정한 배경색으로 지정
    //   });
    // });

    // 패스워드 모달 닫기
    click($passwordModalClose, () => {
      $passwordModal.style.display = "none";
    });

    // 페이지네이션
    click($paginationBefore, () => {
      if (pagination > 1) {
        pagination -= 1;
        updateGameRoomList();
      }
    });

    click($paginationAfter, () => {
      if (pagination < maxPage) {
        pagination += 1;
        updateGameRoomList();
      }
    });

    // 방 걸러보기
    const $1vs1FilterBtn = document.getElementById("1vs1-filter-btn");
    const $tournamentFilterBtn = document.getElementById(
      "tournament-filter-btn",
    );

    click($1vs1FilterBtn, () => {
      if (mode === 2) {
        mode = 1;
        $1vs1FilterBtn.style.color = "white";
      } else if (mode === 1) {
        mode = 2;
        $1vs1FilterBtn.style.color = "yellow";
      } else {
        return;
      }
      pagination = 1;
      updateGameRoomList();
    });

    click($tournamentFilterBtn, () => {
      if (mode === 2) {
        mode = 0;
        $tournamentFilterBtn.style.color = "white";
      } else if (mode === 0) {
        mode = 2;
        $tournamentFilterBtn.style.color = "yellow";
      } else {
        return;
      }
      pagination = 1;
      updateGameRoomList();
    });

    // 신속히 입장
    click(document.getElementById("quick-join"), () => {
      enterRoom(0);
    });

    // 게임 방 만들기 모달
    const $1vs1ModeBtn = document.getElementById("1vs1-toggle-btn");
    const $tournamentModeBtn = document.getElementById("tournament-toggle-btn");
    const $makeRoomBtn = document.getElementById("make-room-btn");

    click($1vs1ModeBtn, () => {
      $tournamentModeBtn.style.opacity = "0.5";
      $1vs1ModeBtn.style.opacity = "1";
    });

    click($tournamentModeBtn, () => {
      $1vs1ModeBtn.style.opacity = "0.5";
      $tournamentModeBtn.style.opacity = "1";
    });

    click($makeRoomBtn, () => {
      const $roomNameInput = document.getElementById("room-name-input");
      const $passwordInput = document.getElementById("password-input");

      if ($roomNameInput.value === "") {
        alert("방 이름을 입력해주세요.");
        return;
      }
      fetch(`${BACKEND}/games/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: $roomNameInput.value,
          password: $passwordInput.value,
          mode:
            $tournamentModeBtn.style.opacity === "1"
              ? "casual_tournament"
              : "casual_1vs1",
        }),
      })
        .then((res) => {
          if (res.status === 201) {
            return res.json();
          } else {
            throw new Error("방 만들기 실패");
          }
        })
        .then((res) => {
          enterRoom(res.id, $passwordInput.value);
        });
    });
  };

  this.unmount = () => {
    clearInterval(intervalId);
  };

  /*
  임시 gameRoomList 오브젝트
  id	number	게임방 테이블의 ID값
	title	string	방 제목
	is_secret	boolean	비밀번호 여부
	player_num	number	게임방에 참가한 사람의 수
	mode	number	0: 1 vs 1, 1: 토너먼트
	started	boolean	게임 시작 여부 (true: 게임중, false: 대기방)
  */

  let gameRoomListInput = {
    total_pages: 1,
    data: null,
  };

  let [getGameRoomList, setGameRoomList] = useState(
    gameRoomListInput,
    this,
    "renderGameRoomList",
  );

  let updateGameRoomList = () => {
    fetch(`${BACKEND}/games/?mode=${mode}&page=${pagination}`).then((res) => {
      res.json().then((data) => {
        maxPage = data.total_pages;
        setGameRoomList(data);
      });
    });
  };
  init();
  addEventListenersToLayout();
  const intervalId = setInterval(updateGameRoomList, 1000);
}
