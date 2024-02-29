import TournamentHistoriesDetails from "./tournament-histories-details.js";
import { click } from "../../utils/clickEvent.js";
import {
  addPaginationOnClickProperty,
  initializePagination,
  setPaginationActive,
} from "../../utils/pagination.js";
import { HISTORIES_IMAGE_PATH } from "../../global.js";

export default async function TournamentHistories(isCustomMode) {
  this.$pagination = document.getElementById("pagination");
  this.needToRender = true;
  const init = () => {
    this.textContent = "";
    this.$prev = document.getElementById("prev");
    this.$next = document.getElementById("next");
    this.totalPages = 0;
    initializePagination(this.$pagination, this.$prev, this.$next);
    getTournamentList();
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
    for (let data of this.state) {
      let $listItem = document.createElement("div");
      $listItem.classList.add("histories");
      $listItem.classList.add("tournament");
      $listItem.classList.add("list-item");
      $listItem.dataset.itemId = data.id;
      $listItem.insertAdjacentHTML(
        "afterbegin",
        `
        ${renderRanking(data.player.ranking)}
        ${renderPlayer(data.player)}
        ${renderOpponents(data.opponents)}
      `,
      );
      click($listItem, TournamentHistoriesDetails.bind(this, data.id));
      $listWrapper.appendChild($listItem);
    }
  };

  const render = () => {
    this.insertAdjacentHTML(
      "afterbegin",
      `
      <div class="histories" id="list-wrapper"></div>
    `,
    );
    renderList();
  };

  init();
}
