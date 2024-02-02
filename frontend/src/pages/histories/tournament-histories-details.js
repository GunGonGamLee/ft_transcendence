import { click, onClick } from "../../utils/clickEvent.js";

export default async function TournamentHistoriesDetails(id) {
  this.needToRender = true;

  this.init = () => {
    this.textContent = "";
    this.$prev = document.getElementById("prev");
    this.$next = document.getElementById("next");
    onClick(this.$prev, this.renderTournamentTree);
    onClick(this.$next, this.renderTournamentResult);
  };

  this.useState = async () => {
    // TODO => 백엔드에서 토너먼트 모드에 대한 데이터를 받아오기
    this.newState = {
      match1: {
        player1: {
          avatar: "luke_skywalkrer",
          nickname: "hyojocho",
          rating: 1234,
        },
        player2: {
          avatar: "luke_skywalkrer",
          nickname: "hyojocho",
          rating: 110,
        },
      },
      match2: {
        player1: {
          avatar: "luke_skywalkrer",
          nickname: "hyojocho",
          rating: 110,
        },
        player2: {
          avatar: "luke_skywalkrer",
          nickname: "hyojocho",
          rating: 1234,
        },
      },
      match3: {
        player1: {
          avatar: "luke_skywalkrer",
          nickname: "hyojocho",
          rating: 1234,
        },
        player2: {
          avatar: "luke_skywalkrer",
          nickname: "hyojocho",
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

  this.renderTournamentTree = () => {
    console.log("TODO => 토너먼트 트리 렌더링");
  };

  this.renderTournamentResult = () => {
    console.log("TODO => 토너먼트 결과 렌더링");
  };

  this.init();
  await this.useState();
  this.setState();
  this.render();
}
