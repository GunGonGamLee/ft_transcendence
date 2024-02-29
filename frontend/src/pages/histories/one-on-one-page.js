import { click } from "../../utils/clickEvent.js";
import {
  initializePagination,
  setPaginationActive,
} from "../../utils/pagination.js";
import { BACKEND, HISTORIES_IMAGE_PATH } from "../../global.js";
import useState from "../../utils/useState.js";
import { getCookie } from "../../utils/cookie.js";
import { getUserMe } from "../../utils/userUtils.js";
import { navigate } from "../../utils/navigate.js";

/**
 * 사용자 지정 모드의 전적 리스트를 렌더링합니다.
 * @constructor 전적 리스트의 게임 모드
 */
export default async function OneOnOneHistories(mode) {
  this.$customList = document.getElementById("content");
  this.$pagination = document.getElementById("pagination");

  const init = () => {
    this.$customList.textContent = "";
    this.$prev = document.getElementById("prev");
    this.$next = document.getElementById("next");
    this.totalPages = 0;
    initializePagination(this.$pagination, this.$prev, this.$next);
    getOneOnOneList();
  };

  const getOneOnOneList = () => {
    let page = this.$prev.dataset.page + 1;
    getUserMe().then((response) => {
      let { nickname } = response.data;
      fetch(
        `${BACKEND}/games/results?user=${nickname}&mode=${mode}&currentPage=${page}&limit=4`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${getCookie("jwt")}`,
            "Content-type": "application/json",
          },
        },
      ).then((response) => {
        if (response.ok) {
          response.json().then((data) => {
            this.totalPages = data.total_pages;
            setPagination();
            set1vs1Histories(data);
          });
        } else {
          navigate("error", { errorCode: response.status });
        }
      });
    });
  };

  const setPagination = () => {
    if (this.totalPages === 1) {
      // 페이지가 1개인 경우
      setPaginationActive(this.$prev, false, null);
      setPaginationActive(this.$next, false, null);
    } else if (this.totalPages > 1) {
      // 페이지가 2개 이상인 경우
      if (this.$prev.dataset.page === "0") {
        setPaginationActive(this.$prev, false, null);
        setPaginationActive(this.$next, true, getOneOnOneList);
      }
      if (this.$next.dataset.page === this.totalPages + 1) {
        setPaginationActive(this.$prev, true, getOneOnOneList);
        setPaginationActive(this.$next, false, null);
      }
    }
  };

  /**
   * 사용자 지정 모드의 전적 리스트를 렌더링합니다.
   * 1. 플레이어 1의 정보를 렌더링합니다.
   * 2. 게임 모드(1 vs 1 로고 또는 토너먼트 로고)를 렌더링합니다.
   * 3. 플레이어 2의 정보를 렌더링합니다.
   */
  this.render = () => {
    this.$customList.insertAdjacentHTML(
      "afterbegin",
      `
        <div class="histories" id="list-wrapper"></div>
        `,
    );
    let $listWrapper = document.getElementById("list-wrapper");
    render1vs1($listWrapper);
  };

  /**
   * 사용자 지정 게임의 1 vs 1 모드 전적 리스트를 렌더링합니다.
   * @param $listWrapper {HTMLElement} 전적 리스트를 렌더링할 <div> 엘리먼트
   */
  const render1vs1 = ($listWrapper) => {
    let { data } = get1vs1Histories();
    if (data.length === 0) {
      this.$customList.innerHTML = `<p class="histories empty-list">비었다.</p>`;
      return;
    }
    for (let item of data) {
      const { id, player1, player2 } = item;
      $listWrapper.insertAdjacentHTML(
        "beforeend",
        `
        <div class="histories casual list-item" data-item-id="${id}">
            ${renderPlayer(player1)}
            ${renderGameMode()}
            ${renderPlayer(player2)}
        </div>
      `,
      );
      let $listItemDiv = $listWrapper.lastElementChild;
      click($listItemDiv, () => {
        navigate(`histories/details?mode=${mode}&gameId=${id}`, { gameId: id });
      });
      $listWrapper.appendChild($listItemDiv);
    }
  };

  /**
   * 전적 리스트의 플레이어 정보를 렌더링합니다.
   * @param data {{avatar: string, nickname: string, rating: string}} 전적 리스트의 플레이어 정보
   */
  const renderPlayer = (data) => {
    return `
      <div class="histories casual player">
        <img class="histories casual avatar" src="${HISTORIES_IMAGE_PATH}/avatar/${data.avatar}" alt="player1-avatar">
        <div class="histories casual nickname">${data.nickname}</div>
        <div class="histories casual rating">Rating: ${data.rating}</div>
      </div>
    `;
  };

  /**
   * 전적 리스트의 게임 모드(1 vs 1 로고 또는 토너먼트 로고)를 렌더링합니다.
   */
  const renderGameMode = () => {
    return `
      <div class="histories casual game-mode">
        <img class="histories causal logo" src= "${HISTORIES_IMAGE_PATH}/1vs1_logo.png" alt="1v1">
      </div>
    `;
  };

  init();
  let [get1vs1Histories, set1vs1Histories] = useState({}, this, "render");
}
