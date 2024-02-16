import TournamentHistoriesDetails from "./tournament-histories-details.js";
import { click } from "../../utils/clickEvent.js";
import { addPaginationOnClickProperty } from "../../utils/pagination.js";
import { HISTORIES_IMAGE_PATH } from "../../global.js";

export default async function TournamentHistories(isCustomMode) {
  this.$pagination = document.getElementById("pagination");
  this.needToRender = true;
  this.init = () => {
    this.textContent = "";
    this.$pagination.style.display = "block";
    addPaginationOnClickProperty(
      "prev",
      "next",
      () => console.log("TODO => 이전 페이지로 이동하기"),
      () => console.log("TODO => 다음 페이지로 이동하기"),
    );
  };

  /**
   * 토너먼트 모드에 대한 데이터를 받아옵니다. 만약 isCustomMode가 true라면 사용자 지정 모드의 토너먼트 모드에 대한 데이터를 받아옵니다.
   * 아니라면 일반 토너먼트 모드에 대한 데이터를 받아옵니다.
   * @param isCustomMode {boolean} 사용자 지정 모드인지 아닌지에 대한 boolean 값.
   * @returns {Promise<void>} 토너먼트 모드에 대한 데이터.
   */
  this.useState = async (isCustomMode) => {
    // TODO => 백엔드에서 토너먼트 모드에 대한 데이터를 받아오기
    this.newState = [
      {
        id: 1,
        player: {
          nickname: "hyojocho",
          avatar: "luke_skywalker.png",
          ranking: 1,
        },
        opponents: [
          {
            nickname: "yena",
            avatar: "chewbacca.png",
            ranking: 3,
          },
          {
            nickname: "yena",
            avatar: "chewbacca.png",
            ranking: 2,
          },
          {
            nickname: "yena",
            avatar: "chewbacca.png",
            ranking: 1,
          },
        ],
        date: "2023.01.30 13:55:23",
      },
      {
        id: 2,
        player: {
          nickname: "hyojocho",
          avatar: "luke_skywalker.png",
          ranking: 3,
        },
        opponents: [
          {
            nickname: "yena",
            avatar: "chewbacca.png",
            ranking: 3,
          },
          {
            nickname: "yena",
            avatar: "chewbacca.png",
            ranking: 2,
          },
          {
            nickname: "yena",
            avatar: "chewbacca.png",
            ranking: 1,
          },
        ],
        date: "2023.01.30 14:55:23",
      },
      {
        id: 3,
        player: {
          nickname: "hyojocho",
          avatar: "luke_skywalker.png",
          ranking: 3,
        },
        opponents: [
          {
            nickname: "yena",
            avatar: "chewbacca.png",
            ranking: 3,
          },
          {
            nickname: "yena",
            avatar: "chewbacca.png",
            ranking: 2,
          },
          {
            nickname: "yena",
            avatar: "chewbacca.png",
            ranking: 1,
          },
        ],
        date: "2023.01.30 16:55:23",
      },
      {
        id: 4,
        player: {
          nickname: "hyojocho",
          avatar: "luke_skywalker.png",
          ranking: 3,
        },
        opponents: [
          {
            nickname: "yena",
            avatar: "chewbacca.png",
            ranking: 3,
          },
          {
            nickname: "yena",
            avatar: "chewbacca.png",
            ranking: 2,
          },
          {
            nickname: "yena",
            avatar: "chewbacca.png",
            ranking: 1,
          },
        ],
        date: "2023.01.30 17:55:23",
      },
    ];
  };

  this.setState = () => {
    if (this.state !== this.newState) {
      this.state = this.newState;
      this.needToRender = true;
    } else {
      this.needToRender = false;
    }
  };

  /**
   * 랭킹을 렌더링합니다.
   * @param ranking {number} 랭킹.
   * @returns {string} 랭킹을 렌더링하는 HTML.
   */
  this.renderRanking = (ranking) => {
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
  this.renderPlayer = ({ nickname, avatar, ranking }) => {
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
  this.renderOpponents = (opponents) => {
    let html = `<div class= "histories tournament opponents">`;
    for (let opponent of opponents) {
      let imageTag = "";
      let fontColor = "";
      if (opponent.ranking === 1) {
        imageTag = `
          <img class="histories" src="${HISTORIES_IMAGE_PATH}/winner.png" alt="first">
       `;
        fontColor = `style="color: #FF52A0"`;
      }
      html +=
        `
      <img class="histories tournament opponents-avatar" src = "${HISTORIES_IMAGE_PATH}/avatar/${opponent.avatar}" alt="avatar">
      <div class="histories tournament opponents-nickname" ${fontColor}>
        ${opponent.nickname}
        <div class="histories tournament opponents-ranking first">
      ` +
        imageTag +
        `
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
  this.renderList = () => {
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
        ${this.renderRanking(data.player.ranking)}
        ${this.renderPlayer(data.player)}
        ${this.renderOpponents(data.opponents)}
      `,
      );
      click($listItem, TournamentHistoriesDetails.bind(this, data.id));
      $listWrapper.appendChild($listItem);
    }
  };

  this.render = () => {
    this.insertAdjacentHTML(
      "afterbegin",
      `
      <div class="histories" id="list-wrapper"></div>
    `,
    );
    this.renderList();
  };

  this.init();
  await this.useState(isCustomMode);
  this.setState();
  this.render();
}
