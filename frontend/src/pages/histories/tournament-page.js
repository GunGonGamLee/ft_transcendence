export default async function TournamentHistories(isCustomMode) {
  this.$pagination = document.getElementById("pagination");
  this.needToRender = true;
  this.avatarPath = "../../../assets/images/avatar";

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
            rnaking: 3,
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

  this.renderRanking = (ranking) => {
    return (`
      <div class="histories" id="ranking">
        ${ranking}등
      </div>
    `);
  }

  this.renderPlayer = ({nickname, avatar, ranking}) => {
    return (`
      <div class="histories" id="player">
        <div class="histories" id="player-avatar">
          <img class="histories" src="${this.avatarPath}/${avatar}.png" alt="avatar">
        </div>
        <div class="histories" id="player-nickname">
          ${nickname}
        </div>
      </div>
    `);
  }

  this.renderOpponents = ([{nickname, avatar, ranking}, ...opponents]) => {
    return (`
      <div class="histories" id="opponents">
        <div class="histories" id="opponents-avatar">
            <img class="histories" src="${this.avatarPath}/${avatar}.png" alt="avatar">
        </div>
      </div>
    `);
  }

  this.renderList = () => {
    let $listWrapper = document.getElementById("list-wrapper");
    for (let data of this.state) {
      $listWrapper.insertAdjacentHTML("afterbegin", `
        ${this.renderRanking(data.player.ranking)}
        ${this.renderPlayer(data.player)}
        ${this.renderOpponents(data.opponents)}
      `)
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
