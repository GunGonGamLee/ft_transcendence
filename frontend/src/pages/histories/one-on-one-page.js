import { click } from "../../utils/clickEvent.js";
import OneOnOneHistoriesDetails from "./one-on-one-histories-details.js";
import { addPaginationOnClickProperty } from "../../utils/pagination.js";
import { HISTORIES_IMAGE_PATH } from "../../global.js";

/**
 * 사용자 지정 모드의 전적 리스트를 렌더링합니다.
 * @constructor 전적 리스트의 게임 모드
 */
export default async function OneOnOneHistories() {
  this.$customList = document.getElementById("content");
  this.$pagination = document.getElementById("pagination");

  this.init = () => {
    this.$customList.textContent = "";
    this.$pagination.style.display = "block";
    addPaginationOnClickProperty(
      "prev",
      "next",
      () => console.log("TODO => 이전 페이지로 이동하기"),
      () => console.log("TODO => 다음 페이지로 이동하기"),
    );
    this.mode = mode;
    this.needToRender = true;
  };

  this.useState = async () => {
    // TODO => backend로부터 데이터 받아오기
    this.newState = [
      {
        id: 1,
        player1: {
          nickname: "hyojocho",
          avatar: "luke_skywalker.png",
          rating: 2130,
          is_winner: true,
        },
        player2: {
          nickname: "yena",
          avatar: "chewbacca.png",
          rating: 110,
          is_winner: false,
        },
      },
      {
        id: 2,
        player1: {
          nickname: "hyojocho",
          avatar: "luke_skywalker.png",
          rating: 2130,
          is_winner: true,
        },
        player2: {
          nickname: "yena",
          avatar: "chewbacca.png",
          rating: 110,
          is_winner: false,
        },
      },
      {
        id: 3,
        player1: {
          nickname: "hyojocho",
          avatar: "luke_skywalker.png",
          rating: 2130,
          is_winner: true,
        },
        player2: {
          nickname: "yena",
          avatar: "chewbacca.png",
          rating: 110,
          is_winner: false,
        },
      },
      {
        id: 4,
        player1: {
          nickname: "hyojocho",
          avatar: "chewbacca.png",
          rating: 2130,
          is_winner: true,
        },
        player2: {
          nickname: "donghyk2",
          avatar: "han_solo.png",
          rating: 2120,
          is_winner: false,
        },
      },
    ];
  };

  this.setState = () => {
    if (this.state === this.newState) {
      this.needToRender = false;
      return;
    }
    this.state = this.newState;
    this.needToRender = true;
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
    this.render1vs1($listWrapper);
  };

  /**
   * 사용자 지정 게임의 1 vs 1 모드 전적 리스트를 렌더링합니다.
   * @param $listWrapper {HTMLElement} 전적 리스트를 렌더링할 <div> 엘리먼트
   */
  this.render1vs1 = ($listWrapper) => {
    for (let data of this.state) {
      const { id, player1, player2 } = data;
      $listWrapper.insertAdjacentHTML(
        "beforeend",
        `
        <div class="histories casual list-item" data-item-id="${id}">
            ${this.renderPlayer(player1)}
            ${this.renderGameMode()}
            ${this.renderPlayer(player2)}
        </div>
      `,
      );
      let $listItemDiv = $listWrapper.lastElementChild;
      click($listItemDiv, () => {
        OneOnOneHistoriesDetails.bind(this, id, "1vs1")();
      });
      $listWrapper.appendChild($listItemDiv);
    }
  };

  /**
   * 전적 리스트의 플레이어 정보를 렌더링합니다.
   * @param data {{avatar: string, nickname: string, rating: string}} 전적 리스트의 플레이어 정보
   */
  this.renderPlayer = (data) => {
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
  this.renderGameMode = () => {
    return `
      <div class="histories casual game-mode">
        <img class="histories causal logo" src= "${HISTORIES_IMAGE_PATH}/1vs1_logo.png" alt="1v1">
      </div>
    `;
  };

  this.init();
  await this.useState();
  this.setState();
  this.render();
}
