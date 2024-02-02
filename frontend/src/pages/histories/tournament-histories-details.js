import { addPaginationOnClickProperty } from "../../utils/pagination.js";

export default async function TournamentHistoriesDetails(id) {
  this.needToRender = true;
  this.imagePath = "../../../assets/images";

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
                <div class="histories tournament match player1 nickname">
                    ${matchData.player1.nickname}
                </div>
                <div class="histories tournament match player1 rating">
                    ${matchData.player1.rating}
                </div>
            </div>
            <div class="histories tournament match player2">
                <img src="${this.imagePath}/avatar/${matchData.player2.avatar}.png" alt="avatar">
                <div class="histories tournament match player2 nickname">
                    ${matchData.player2.nickname}
                </div>
                <div class="histories tournament match player2 rating">
                    ${matchData.player2.rating}
                </div>
            </div>
    `,
    );
    $treeWrapper.appendChild($match);
  };

  this.renderFinal = ($treeWrapper, finalData) => {
    let $final = document.createElement("div");
    $final.className = "histories tournament";
    $final.id = "final";
    $final.insertAdjacentHTML(
      "afterbegin",
      `
            <div class="histories tournament final player1">
                <img src="${this.imagePath}/avatar/${finalData.player1.avatar}.png" alt="avatar">
                <div class="histories tournament final player1 nickname">
                    ${finalData.player1.nickname}
                </div>
                <div class="histories tournament final player1 rating">
                    ${finalData.player1.rating}
                </div>
            </div>
            <div class="histories tournament final trophy">
                <img src="${this.imagePath}/tournament_logo.png" alt="tournament_logo">
            </div>
            <div class="histories tournament final player2">
                <img src="${this.imagePath}/avatar/${finalData.player2.avatar}.png" alt="avatar">
                <div class="histories tournament final player2 nickname">
                    ${finalData.player2.nickname}
                </div>
                <div class="histories tournament final player2 rating">
                    ${finalData.player2.rating}
                </div>
            </div>
    `,
    );
    $treeWrapper.appendChild($final);
  };

  this.renderTournamentTree = () => {
    let $treeWrapper = document.createElement("div");
    $treeWrapper.id = "tree-wrapper";
    $treeWrapper.className = "histories tournament";
    this.renderMatch($treeWrapper, this.state.match1);
    this.renderFinal($treeWrapper, this.state.match3);
    this.renderMatch($treeWrapper, this.state.match2);
    this.appendChild($treeWrapper);
  };

  this.renderTournamentResult = () => {
    console.log("TODO => 토너먼트 결과 렌더링");
  };

  this.init();
  await this.useState();
  this.setState();
  this.render();
}
