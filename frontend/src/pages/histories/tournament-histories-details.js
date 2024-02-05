import { addPaginationOnClickProperty } from "../../utils/pagination.js";

export default async function TournamentHistoriesDetails(id) {
  this.needToRender = true;
  this.imagePath = "../../../assets/images";

  // TODO => 이전 버튼 클릭 시 컴포넌트가 중복되는 문제 해결해야 함
  this.init = () => {
    this.textContent = "";
    addPaginationOnClickProperty(
      "prev",
      "next",
      this.renderTournamentTree,
      this.renderTournamentResult,
    );
  };

  this.useState = async () => {
    // TODO => 백엔드에서 토너먼트 모드에 대한 데이터를 받아오기
    this.newState = {
      match1: {
        player1: {
          avatar: "luke_skywalker",
          nickname: "hyojocho",
          rating: 1234,
        },
        player2: {
          avatar: "chewbacca",
          nickname: "yena",
          rating: 110,
        },
      },
      match2: {
        player1: {
          avatar: "han_solo",
          nickname: "sejokim",
          rating: 5,
        },
        player2: {
          avatar: "darth_vader",
          nickname: "Polarbear",
          rating: 1234,
        },
      },
      match3: {
        player1: {
          avatar: "chewbacca",
          nickname: "yena",
          rating: 110,
        },
        player2: {
          avatar: "han_solo",
          nickname: "sejokim",
          rating: 1234,
        },
        winner: "yena",
        date: "2023.02.01 13:30:23",
      },
    };
  };

  this.setState = () => {
    if (this.newState !== this.state) {
      this.state = this.newState;
      this.needToRender = true;
    } else this.needToRender = false;
  };

  this.render = () => {
    if (this.needToRender) {
      this.renderTournamentTree();
    }
  };

  this.renderMatch = ($treeWrapper, matchData) => {
    let $match = document.createElement("div");
    $match.className = "histories tournament match";
    $match.insertAdjacentHTML(
      "afterbegin",
      `
            <div class="histories tournament match player1">
                <img src="${this.imagePath}/avatar/${matchData.player1.avatar}.png" alt="avatar">
                <div class="histories tournament match nickname">
                    ${matchData.player1.nickname}
                </div>
                <div class="histories tournament match rating">
                    Rating: ${matchData.player1.rating}
                </div>
            </div>
            <div class="histories tournament match player2">
                <img src="${this.imagePath}/avatar/${matchData.player2.avatar}.png" alt="avatar">
                <div class="histories tournament match nickname">
                    ${matchData.player2.nickname}
                </div>
                <div class="histories tournament match rating">
                    Rating: ${matchData.player2.rating}
                </div>
            </div>
    `,
    );
    $treeWrapper.appendChild($match);
  };

  this.renderFinalWinner = (finalData) => {
    let winnerVisibilityOfPlayer1 =
      finalData.winner === finalData.player1.nickname ? "visible" : "hidden";
    let winnerVisibilityOfPlayer2 =
      finalData.winner === finalData.player2.nickname ? "visible" : "hidden";
    return `
    <div class="histories tournament final winner">
        <img src="${this.imagePath}/winner.png" alt="winner" style="visibility: ${winnerVisibilityOfPlayer1}">
    </div>
    <div></div>
    <div class="histories tournament final winner">
        <img src="${this.imagePath}/winner.png" alt="winner" style="visibility: ${winnerVisibilityOfPlayer2}">
    </div>
    `;
  };

  this.renderFinalPlayers = (finalData) => {
    return `
    <div class="histories tournament final player1">
        <img src="${this.imagePath}/avatar/${finalData.player1.avatar}.png" alt="avatar">
        <div class="histories tournament nickname">
            ${finalData.player1.nickname}
        </div>
        <div class="histories tournament match rating">
            Rating: ${finalData.player1.rating}
        </div>
    </div>
    <div class="histories tournament final trophy">
        <img src="${this.imagePath}/tournament_logo.png" alt="tournament_logo">
    </div>
    <div class="histories tournament final player2">
        <img src="${this.imagePath}/avatar/${finalData.player2.avatar}.png" alt="avatar">
        <div class="histories tournament match nickname">
            ${finalData.player2.nickname}
        </div>
        <div class="histories tournament match rating">
            Rating: ${finalData.player2.rating}
        </div>
    </div>
    `;
  };

  this.renderFinal = ($treeWrapper, finalData) => {
    let $final = document.createElement("div");
    $final.className = "histories tournament";
    $final.id = "final";
    $final.insertAdjacentHTML(
      "afterbegin",
      `
            ${this.renderFinalWinner(finalData)}
            ${this.renderFinalPlayers(finalData)}
    `,
    );
    $treeWrapper.appendChild($final);
  };

  this.renderTournamentTree = () => {
    this.init();
    let $treeWrapper = document.createElement("div");
    $treeWrapper.id = "tree-wrapper";
    $treeWrapper.className = "histories tournament";
    this.renderMatch($treeWrapper, this.state.match1);
    this.renderFinal($treeWrapper, this.state.match3);
    this.renderMatch($treeWrapper, this.state.match2);
    this.appendChild($treeWrapper);
  };

  this.getResult = () => {
    const { match1, match2, match3 } = this.state;
    let firstPlayer,
      secondPlayer,
      others = {};
    if (match3.winner === match3.player1.nickname) {
      firstPlayer = match3.player1;
      secondPlayer = match3.player2;
    } else {
      firstPlayer = match3.player2;
      secondPlayer = match3.player1;
    }
    const match3PlayerNicknames = [
      match3.player1.nickname,
      match3.player2.nickname,
    ];
    if (!match3PlayerNicknames.includes(match1.player1.nickname)) {
      others.add(match1.player1);
    } else {
      others.add(match1.player2);
    }
    if (!match3PlayerNicknames.includes(match2.player1.nickname)) {
      others.add(match2.player1);
    } else {
      others.add(match2.player2);
    }
    return {
      firstPlayer,
      secondPlayer,
      others,
    };
  };

  this.renderTournamentResult = () => {
    let $resultWrapper = document.createElement("div");
    $resultWrapper.id = "result-wrapper";
    $resultWrapper.className = "histories tournament";
    const result = this.getResult();
  };

  this.init();
  await this.useState();
  this.setState();
  this.render();
}
