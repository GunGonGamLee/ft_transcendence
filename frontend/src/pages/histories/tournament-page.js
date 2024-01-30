export default async function TournamentHistories(isCustomMode) {
  this.$pagination = document.getElementById("pagination");
  this.needToRender = true;
  this.imagePath = "../../../assets/images";
  this.avatarPath = `${this.imagePath}/avatar`;

  this.init = () => {
    this.textContent = "";
    this.$pagination.style.display = "block";
  }

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
          avatar: "blue_bust",
          ranking: 1,
        },
        opponents: [
          {
            nickname: "yena",
            avatar: "green_bust",
            ranking: 2,
          },
          {
            nickname: "yena",
            avatar: "green_bust",
            ranking: 3,
          },
          {
            nickname: "yena",
            avatar: "green_bust",
            ranking: 3,
          },
        ]
      },
      {
        id: 2,
        player: {
          nickname: "hyojocho",
          avatar: "blue_bust",
          ranking: 3,
        },
        opponents: [
          {
            nickname: "yena",
            avatar: "green_bust",
            ranking: 3,
          },
          {
            nickname: "yena",
            avatar: "green_bust",
            ranking: 2,
          },
          {
            nickname: "yena",
            avatar: "green_bust",
            ranking: 1,
          },
        ]
      },
      {
        id: 3,
        player: {
          nickname: "hyojocho",
          avatar: "blue_bust",
          ranking: 3,
        },
        opponents: [
          {
            nickname: "yena",
            avatar: "green_bust",
            ranking: 3,
          },
          {
            nickname: "yena",
            avatar: "green_bust",
            ranking: 2,
          },
          {
            nickname: "yena",
            avatar: "green_bust",
            ranking: 1,
          },
        ]
      },
      {
        id: 4,
        player: {
          nickname: "hyojocho",
          avatar: "blue_bust",
          ranking: 3,
        },
        opponents: [
          {
            nickname: "yena",
            avatar: "green_bust",
            ranking: 3,
          },
          {
            nickname: "yena",
            avatar: "green_bust",
            ranking: 2,
          },
          {
            nickname: "yena",
            avatar: "green_bust",
            ranking: 1,
          },
        ]
      }
    ];
  }

  this.setState = () => {
    if (this.state !== this.newState) {
      this.state = this.newState;
      this.needToRender = true;
    } else {
      this.needToRender = false;
    }
  }

  /**
   * 랭킹을 렌더링합니다.
   * @param ranking {number} 랭킹.
   * @returns {string} 랭킹을 렌더링하는 HTML.
   */
  this.renderRanking = (ranking) => {
    let html = (`
    <div class="histories tournament ranking">
      <div class="histories tournament player-ranking first">
    `);
    if (ranking === 1) {
      html += (`
        <img class="histories" src="${this.imagePath}/winner.png" alt="first">
      `);
    }
    html += (`
      </div>
      <div class="histories ranking-text">
        ${ranking}등
      </div>
    </div>
    `);
    return html;
  }

  /**
   * 플레이어를 렌더링합니다.
   * @param nickname {string} 플레이어의 닉네임.
   * @param avatar {string} 플레이어의 아바타.
   * @param ranking {number} 플레이어의 랭킹.
   * @returns {string} 플레이어를 렌더링하는 HTML.
   */
  this.renderPlayer = ({nickname, avatar, ranking}) => {
    return (`
    <div class="histories tournament player">
      <div class="histories tournament player-avatar">
        <img class="histories" src="${this.avatarPath}/${avatar}.png" alt="avatar">
      </div>
      <div class="histories tournament player-nickname">
        ${nickname}
      </div>
    </div>
    `);
  }

  /**
   * 토너먼트 모드에서 상대방들을 렌더링합니다.
   * @param opponents {Array<{nickname: string, avatar: string, ranking: number}>} 상대방들의 정보.
   * @returns {string} 상대방들을 렌더링하는 HTML.
   */
  this.renderOpponents = (opponents) => {
    let html = (`<div class= "histories tournament opponents">`);
    for (let opponent of opponents) {
      html += (`
      <div class="histories tournament opponents-avatar">
        <img class="histories" src = "${this.avatarPath}/${opponent.avatar}.png" alt="avatar">
      </div>
      <div class="histories tournament opponents-nickname">
        ${opponent.nickname}
      `);
      if (opponent.ranking === 1) {
        html += (`
        <div class="histories tournament opponents-ranking first">
          <img class="histories" src="${this.imagePath}/winner.png" alt="first">
        </div>
       `);
      }
      html += (`</div>`);
    }
    html += (`</div>`);
    return html;
  }

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
      $listItem.insertAdjacentHTML("afterbegin", `
        ${this.renderRanking(data.player.ranking)}
        ${this.renderPlayer(data.player)}
        ${this.renderOpponents(data.opponents)}
      `)
      $listWrapper.appendChild($listItem);
    }
  }

  this.render = () => {
    this.insertAdjacentHTML("afterbegin", `
      <div class="histories" id="list-wrapper"></div>
    `)
    this.renderList();
  }

  this.init();
  await this.useState(isCustomMode);
  this.setState();
  this.render();
}
