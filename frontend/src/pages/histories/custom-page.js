import {hoverChangeBorder, hoverChangeCursor} from "../../utils/hoverEvent.js";
import {click} from "../../utils/clickEvent.js";

/**
 * 사용자 지정 모드의 전적 리스트를 렌더링합니다.
 * @param mode {string} 전적 리스트의 게임 모드 ("1vs1" 또는 "tournament")
 * @constructor 전적 리스트의 게임 모드
 */
export default async function CustomHistories(mode) {
  this.$customList = document.getElementById("list");
  this.$pagination = document.getElementById("pagination");

  this.init = () => {
    this.$customList.textContent = "";
    this.$pagination.style.display = "block";
    this.mode = mode;
    this.needToRender = true;
  }

  this.useState = async () => {
    // TODO => backend로부터 데이터 받아오기
    if (mode === "1vs1") {
      this.newState = [{
        player1: {
          nickname: "hyojocho", avatar: "../../../assets/images/avatar/red.png", rating: 2130, is_winner: true,
        }, player2: {
          nickname: "yena", avatar: "../../../assets/images/avatar/blue.png", rating: 110, is_winner: false,
        },
      }, {
        player1: {
          nickname: "hyojocho", avatar: "../../../assets/images/avatar/red.png", rating: 2130, is_winner: true,
        }, player2: {
          nickname: "yena", avatar: "../../../assets/images/avatar/blue.png", rating: 110, is_winner: false,
        },
      }, {
        player1: {
          nickname: "hyojocho", avatar: "../../../assets/images/avatar/red.png", rating: 2130, is_winner: true,
        }, player2: {
          nickname: "yena", avatar: "../../../assets/images/avatar/blue.png", rating: 110, is_winner: false,
        },
      }, {
        player1: {
          nickname: "hyojocho", avatar: "../../../assets/images/avatar/red.png", rating: 2130, is_winner: true,
        }, player2: {
          nickname: "donghyk2", avatar: "../../../assets/images/avatar/green.png", rating: 2120, is_winner: false,
        },
      },];
    } else if (mode === "tournament") {
      // TODO => 토너먼트 모드 데이터 받아오기
    }
  }

  this.setState = () => {
    if (this.state === this.newState) {
      this.needToRender = false;
      return;
    }
    this.state = this.newState;
    this.needToRender = true;
  }

  /**
   * 사용자 지정 모드의 전적 리스트를 렌더링합니다.
   * 1. 플레이어 1의 정보를 렌더링합니다.
   * 2. 게임 모드(1 vs 1 로고 또는 토너먼트 로고)를 렌더링합니다.
   * 3. 플레이어 2의 정보를 렌더링합니다.
   */
  this.render = () => {
    this.$customList.insertAdjacentHTML("afterbegin", `
        <div class="histories" id="list-wrapper"></div>
        `);
    let $listWrapper = document.getElementById("list-wrapper");
    if (mode === "1vs1") {
      this.render1vs1($listWrapper);
    } else if (mode === "tournament") {
      console.log("TODO => 토너먼트 모드")
      // this.renderTournament($listWrapper);
    }
  }

  /**
   * 사용자 지정 게임의 1 vs 1 모드 전적 리스트를 렌더링합니다.
   * @param $listWrapper {HTMLElement} 전적 리스트를 렌더링할 <div> 엘리먼트
   */
  this.render1vs1 = ($listWrapper) => {
    for (let data of this.state) {
      const {player1, player2} = data;
      $listWrapper.insertAdjacentHTML("beforeend", `
        <div class="histories list-item">
            ${this.renderPlayer(player1)}
            ${this.renderGameMode()}
            ${this.renderPlayer(player2)}
        </div>
      `);
      let $listItemDiv = $listWrapper.lastElementChild;
      hoverChangeBorder($listItemDiv, "3px solid transparent", "3px solid #29ABE2");
      hoverChangeCursor($listItemDiv, "pointer");
      click($listItemDiv, () => {
        console.log("TODO => 전적 상세 페이지로 이동");
      });
      $listWrapper.appendChild($listItemDiv);
    }
  }

  /**
   * 전적 리스트의 플레이어 정보를 렌더링합니다.
   * @param $listItemDiv {HTMLElement} 전적 리스트의 플레이어 정보를 렌더링할 리스트 아이템 <div> 엘리먼트
   * @param data {{avatar: string, nickname: string, rating: string}} 전적 리스트의 플레이어 정보
   */
  this.renderPlayer = (data) => {
    return (`
      <div class="histories player">
        <div class="histories avatar">
            <img class="histories" src="${data.avatar}" alt="player1-avatar">
        </div>
        <div class="histories nickname">${data.nickname}</div>
        <div class="histories rating">Rating: ${data.rating}</div>
      </div>
    `);
  }

  /**
   * 전적 리스트의 게임 모드(1 vs 1 로고 또는 토너먼트 로고)를 렌더링합니다.
   * @param $listItemDiv {HTMLElement} 전적 리스트의 게임 모드를 렌더링할 리스트 아이템 <div> 엘리먼트
   */
  this.renderGameMode = () => {
    if (this.mode === "1vs1") {
      return `
        <div class="histories game-mode">
            <img class="histories" src="../../../assets/images/1vs1_logo.png" alt="1v1">
        </div>
      `;
    } else if (this.mode === "tournament") {
    }
  }

  this.init();
  await this.useState();
  this.setState();
  this.render();
}
