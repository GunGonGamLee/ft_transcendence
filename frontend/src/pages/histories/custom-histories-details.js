export default async function CustomHistoriesDetails(gameId, mode) {
  this.init = () => {
    this.textContent = "";
  }

  this.useState = async () => {
    // TODO => backend로부터 데이터 받아오기
    this.state = {
      id: gameId,
      mode,
      player1: {
        nickname: "hyojocho",
        avatar: "../../../assets/images/avatar/blue.png",
        rating: 2130,
        score: 4,
        is_winner: true,
      }, player2: {
        nickname: "yena",
        avatar: "../../../assets/images/avatar/green.png",
        rating: 110,
        score: 1,
        is_winner: false,
      },
      date: "2024.01.26 13:53",
      playtime: "00:05:23",
    };
  }

  this.setState = () => {

  }

  this.renderPlayer = (player) => {
    return (`
      <div class="histories 1vs1" id="player">
        <div class="histories 1vs1" id="player-avatar">
          <img class="histories 1vs1" src="${player.avatar}" alt="player-avatar">
        </div>
        <div class="histories 1vs1" id="player-info">
          <div class="histories 1vs1" id="player-nickname">${player.nickname}</div>
          <div class="histories 1vs1" id="player-rating">${player.rating}</div>
          <div class="histories 1vs1" id="player-score">${player.score}</div>
        </div>
      </div>
    `);
  }

  this.render1vs1Details = () => {
    this.insertAdjacentHTML("afterbegin", `
      <div class="histories 1vs1" id="details-wrapper">
        <div class="histories 1vs1" id="players">
            ${this.renderPlayer(this.state.player1)}
            :
            ${this.renderPlayer(this.state.player2)}
        </div>
        <div class="histories 1vs1" id="game-info">
            ${this.renderGameInfo()}
        </div>
      </div>
    `);
  }

  this.render = () => {
    if (mode === "1vs1") {
      this.render1vs1Details();
    } else if (mode === "tournament") {
      // this.renderTournamentDetails();
    }
  }

  this.init();
  await this.useState();
  this.setState();
  this.render();
}
