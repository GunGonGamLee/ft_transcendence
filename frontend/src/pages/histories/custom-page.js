import {hoverChangeBorder, hoverChangeCursor} from "../../utils/hoverEvent.js";

export default function CustomHistories() {
  this.$container = document.getElementById("list");
  this.$pagination = document.getElementById("pagination");

  this.init = () => {
    this.$pagination.style.display = "block";
  }

  this.setState = () => {
    this.render();
  }

  /**
   * 사용자 지정 모드의 전적 리스트를 렌더링합니다.
   * 1. 플레이어 1의 정보를 렌더링합니다.
   * 2. 게임 모드(1 vs 1 로고 또는 토너먼트 로고)를 렌더링합니다.
   * 3. 플레이어 2의 정보를 렌더링합니다.
   */
  this.render = () => {
    this.init();
    this.$container.innerHTML = `
        <div class="histories" id="list-wrapper"></div>
        `
    let $listWrapper = document.getElementById("list-wrapper");
    $listWrapper.innerHTML = '';
    let mockData = [
      {
        player1: {
          nickname: "hyojocho",
          avatar: "../../../assets/images/avatar/red.png",
          rating: 2130,
          is_winner: true,
        },
        player2: {
          nickname: "yena",
          avatar: "../../../assets/images/avatar/blue.png",
          rating: 110,
          is_winner: false,
        },
      },
      {
        player1: {
          nickname: "hyojocho",
          avatar: "../../../assets/images/avatar/red.png",
          rating: 2130,
          is_winner: true,
        },
        player2: {
          nickname: "yena",
          avatar: "../../../assets/images/avatar/blue.png",
          rating: 110,
          is_winner: false,
        },
      },
      {
        player1: {
          nickname: "hyojocho",
          avatar: "../../../assets/images/avatar/red.png",
          rating: 2130,
          is_winner: true,
        },
        player2: {
          nickname: "yena",
          avatar: "../../../assets/images/avatar/blue.png",
          rating: 110,
          is_winner: false,
        },
      },
      {
        player1: {
          nickname: "hyojocho",
          avatar: "../../../assets/images/avatar/red.png",
          rating: 2130,
          is_winner: true,
        },
        player2: {
          nickname: "donghyk2",
          avatar: "../../../assets/images/avatar/green.png",
          rating: 2120,
          is_winner: false,
        },
      },
    ]; // TODO: 백엔드로부터 데이터 받아오기
    for (let data of mockData) {
      const listItemDiv = document.createElement("div");
      listItemDiv.className = "histories list-item";
      this.renderPlayer(listItemDiv, data.player1);
      this.renderGameMode(listItemDiv);
      this.renderPlayer(listItemDiv, data.player2);
      hoverChangeBorder(listItemDiv, "3px solid transparent", "3px solid #29ABE2");
      hoverChangeCursor(listItemDiv, "pointer");
      listItemDiv.addEventListener("click", () => {
        console.log("TODO => 전적 상세 페이지로 이동")
      });
      $listWrapper.appendChild(listItemDiv);
    }
  }

  /**
   * 전적 리스트의 플레이어 정보를 렌더링합니다.
   * @param listItemDiv 전적 리스트의 플레이어 정보를 렌더링할 리스트 아이템 <div> 엘리먼트
   * @param data 전적 리스트의 플레이어 정보
   */
  this.renderPlayer = (listItemDiv, data) => {
    const playerDiv = document.createElement("div");
    playerDiv.className = "histories player";
    playerDiv.innerHTML = `
        <div class="histories avatar">
            <img class="histories" src="${data.avatar}" alt="player1-avatar">
        </div>
        <div class="histories nickname">${data.nickname}</div>
        <div class="histories rating">Rating: ${data.rating}</div>
        `;
    listItemDiv.appendChild(playerDiv);
  }

  /**
   * 전적 리스트의 게임 모드(1 vs 1 로고 또는 토너먼트 로고)를 렌더링합니다.
   * @param listItemDiv 전적 리스트의 게임 모드를 렌더링할 리스트 아이템 <div> 엘리먼트
   */
  this.renderGameMode = (listItemDiv) => {
    const gameModeDiv = document.createElement("div");
    gameModeDiv.className = "histories game-mode";
    gameModeDiv.innerHTML = `
        <img class="histories" src="../../../assets/images/1vs1_logo.png" alt="1v1">
        `;
    listItemDiv.appendChild(gameModeDiv);
  }

  this.render();
}
