import { HISTORIES_IMAGE_PATH } from "../../global.js";

export default async function OneOnOneHistoriesDetails(gameId, mode) {
  const init = () => {
    this.textContent = "";
    let $pagination = document.getElementById("pagination");
    $pagination.style.display = "none";
  };

  const useState = async () => {
    // TODO => backend로부터 데이터 받아오기
    this.state = {
      id: gameId,
      mode,
      player1: {
        nickname: "hyojocho",
        avatar: "luke_skywalker.png",
        rating: 2130,
        score: 4,
        is_winner: true,
      },
      player2: {
        nickname: "yena",
        avatar: "chewbacca.png",
        rating: 110,
        score: 1,
        is_winner: false,
      },
      date: "2024.01.26 13:53",
      playtime: "00:05:23",
    };
  };

  const setState = () => {};

  const renderPlayer = (player) => {
    return `
      <div class="histories one-on-one" id="player">
        <div class="histories one-on-one" id="player-avatar">
          <img class="histories one-on-one" src="${HISTORIES_IMAGE_PATH}/avatar/${player.avatar}" alt="player-avatar">
        </div>
        <div class="histories one-on-one" id="player-info">
          <div class="histories one-on-one" id="player-nickname">${player.nickname}</div>
          <div class="histories one-on-one" id="player-rating">Rating: ${player.rating}</div>
          <div class="histories one-on-one" id="player-score">${player.score}</div>
        </div>
      </div>
    `;
  };

  const renderGameInfo = () => {
    const { id, date, playtime } = this.state;
    return `
      <div class="histories one-on-one info-title" id="game-id">게임 번호</div>
      <div class="histories one-on-one info-data">${id}</div>
      <div class="histories one-on-one info-title" id="game-date">게임 날짜</div>
      <div class="histories one-on-one info-data">${date}</div>
      <div class="histories one-on-one info-title" id="game-playtime">게임 시간</div>
      <div class="histories one-on-one info-data">${playtime}</div>
    `;
  };

  const renderOneOnOneDetails = () => {
    this.insertAdjacentHTML(
      "afterbegin",
      `
      <div class="histories one-on-one" id="details-wrapper">
        <div class="histories one-on-one" id="players">
            ${renderPlayer(this.state.player1)}
            <p class="histories" id="score-separator">:</p>
            ${renderPlayer(this.state.player2)}
        </div>
        <div class="histories one-on-one" id="game-info">
            ${renderGameInfo()}
        </div>
      </div>
    `,
    );
  };

  const render = () => {
    renderOneOnOneDetails();
  };

  init();
  await useState();
  setState();
  render();
}
