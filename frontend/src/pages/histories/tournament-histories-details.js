export default async function TournamentHistoriesDetails(id) {
  this.init = () => {
    this.textContent = "";
  };

  this.useState = async () => {
    // TODO => 백엔드에서 토너먼트 모드에 대한 데이터를 받아오기
    this.newState = {
      match1: {
        player1: {
          avatar: "luke_skywalkrer",
          nickname: "hyojocho",
          rating: 1234
        },
        player2: {
          avatar: "luke_skywalkrer",
          nickname: "hyojocho",
          rating: 110
        }
      },
      match2: {
        player1: {
          avatar: "luke_skywalkrer",
          nickname: "hyojocho",
          rating: 110
        }
        ,
        player2: {
          avatar: "luke_skywalkrer",
          nickname: "hyojocho",
          rating: 1234
        }
      },
      match3: {
        player1: {
          avatar: "luke_skywalkrer",
          nickname: "hyojocho",
          rating: 1234
        },
        player2: {
          avatar: "luke_skywalkrer",
          nickname: "hyojocho",
          rating: 1234
        },
        winner: "yena",
        date: "2023.02.01 13:30:23"
      }
    }
    ;

    this.setState = () => {
    };

    this.render = () => {
    };
  }
