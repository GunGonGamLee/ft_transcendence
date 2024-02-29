import { click } from "../../utils/clickEvent.js";
import {
  initializePagination,
  setPaginationActive,
} from "../../utils/pagination.js";
import { BACKEND, HISTORIES_IMAGE_PATH } from "../../global.js";
import { getUserMe } from "../../utils/userUtils.js";
import useState from "../../utils/useState.js";
import { getCookie } from "../../utils/cookie.js";
import { navigate } from "../../utils/navigate.js";

export default async function TournamentHistories(mode) {
  this.$tournamentList = document.getElementById("content");
  this.$pagination = document.getElementById("pagination");
  const init = () => {
    this.$tournamentList.textContent = "";
    this.$prev = document.getElementById("prev");
    this.$next = document.getElementById("next");
    this.totalPages = 0;
    initializePagination(this.$pagination, this.$prev, this.$next);
    getTournamentList();
  };

  const getTournamentList = () => {
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
            setTournamentHistories(data);
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
        setPaginationActive(this.$next, true, getTournamentList);
      }
      if (this.$next.dataset.page === this.totalPages + 1) {
        setPaginationActive(this.$prev, true, getTournamentList);
        setPaginationActive(this.$next, false, null);
      }
    }
  };

  /**
   * 랭킹을 렌더링합니다.
   * @param ranking {number} 랭킹.
   * @returns {string} 랭킹을 렌더링하는 HTML.
   */
  const renderRanking = (ranking) => {
    let html = `
    <div class="histories tournament ranking">
      <div class="histories tournament player-ranking first">
    `;
    if (ranking === 1) {
      html += `
        <img class="histories" src="${HISTORIES_IMAGE_PATH}/winner.png" alt="first">
      `;
    }
    html += `
      </div>
      <div class="histories ranking-text">
        ${ranking}등
      </div>
    </div>
    `;
    return html;
  };

  /**
   * 플레이어를 렌더링합니다.
   * @param nickname {string} 플레이어의 닉네임.
   * @param avatar {string} 플레이어의 아바타.
   * @param ranking {number} 플레이어의 랭킹.
   * @returns {string} 플레이어를 렌더링하는 HTML.
   */
  const renderPlayer = ({ nickname, avatar, ranking }) => {
    let fontColor = "";
    if (ranking === 1) {
      fontColor = `style="color: #FF52A0"`;
    }
    return `
    <div class="histories tournament player">
      <img class="histories tournament player-avatar" src="${HISTORIES_IMAGE_PATH}/avatar/${avatar}" alt="avatar">
      <div class="histories tournament player-nickname" ${fontColor}>
        ${nickname}
      </div>
    </div>
    `;
  };

  /**
   * 토너먼트 모드에서 상대방들을 렌더링합니다.
   * @param opponents {Array<{nickname: string, avatar: string, ranking: number}>} 상대방들의 정보.
   * @returns {string} 상대방들을 렌더링하는 HTML.
   */
  const renderOpponents = (opponents) => {
    let html = `<div class= "histories tournament opponents">`;
    for (let opponent of opponents) {
      let imageDisplay = `style="display: none"`;
      let fontColor = `style="color: white"`;
      if (opponent.ranking === 1) {
        imageDisplay = `style="display: block"`;
        fontColor = `style="color: #FF52A0"`;
      }
      html += `
      <img class="histories tournament opponents-avatar" src = "${HISTORIES_IMAGE_PATH}/avatar/${opponent.avatar}" alt="avatar">
      <div class="histories tournament opponents-nickname" ${fontColor}>
        ${opponent.nickname}
        <div class="histories tournament opponents-ranking first">
          <img class="histories" src="${HISTORIES_IMAGE_PATH}/winner.png" alt="first" ${imageDisplay}>
        </div>
      </div>
      `;
    }
    html += `</div>`;
    return html;
  };

  /**
   * 토너먼트 모드에서 리스트를 렌더링합니다.
   */
  const renderList = () => {
    let $listWrapper = document.getElementById("list-wrapper");
    let { data } = getTournamentHistories();
    if (data.length === 0) {
      this.$tournamentList.innerHTML = `<p class="histories empty-list">비었다.</p>`;
      return;
    }
    for (let item of data) {
      let $listItem = document.createElement("div");
      const { id, player, opponents } = item;
      $listItem.classList.add("histories");
      $listItem.classList.add("tournament");
      $listItem.classList.add("list-item");
      $listItem.dataset.itemId = id;
      $listItem.insertAdjacentHTML(
        "afterbegin",
        `
        ${renderRanking(player["ranking"])}
        ${renderPlayer(player)}
        ${renderOpponents(opponents)}
      `,
      );
      click($listItem, () => {
        navigate(`histories/details?mode=${mode}&gameId=${data.id}`, {
          gameId: data.id,
        });
      });
      $listWrapper.appendChild($listItem);
    }
  };

  this.render = () => {
    this.$tournamentList.insertAdjacentHTML(
      "afterbegin",
      `
      <div class="histories" id="list-wrapper"></div>
    `,
    );
    renderList();
  };

  init();
  let [getTournamentHistories, setTournamentHistories] = useState(
    {},
    this,
    "render",
  );
}
