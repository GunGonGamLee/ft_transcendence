import { BACKEND, HISTORIES_IMAGE_PATH } from "../../global.js";
import { navigate } from "../../utils/navigate.js";
import { getCookie } from "../../utils/cookie.js";
import useState from "../../utils/useState.js";
import { getUserMe } from "../../utils/userUtils.js";

export default function OneOnOneHistoriesDetails(gameId) {
  const init = () => {
    this.textContent = "";
    let $pagination = document.getElementById("pagination");
    $pagination.style.display = "none";
    getUserMe().then((response) => {
      if (response.status !== 200) {
        navigate("error", { errorCode: response.status });
      }
      let { nickname } = response.data;
      fetch(`${BACKEND}/games/results/${gameId}?user=${nickname}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("jwt")}`,
        },
      }).then((response) => {
        if (response.ok) {
          response.json().then((data) => {
            setOneOnOneHistoriesDetails(data);
          });
        } else {
          navigate("error", { errorCode: response.status });
        }
      });
    });
  };

  /**
   * 우승자는 승리 아이콘을 렌더링합니다.
   * @param winner { boolean } - 우승자 여부
   */
  const renderWinnerIcon = (winner) => {
    let className = winner ? "winner" : "loser";
    return `
        <div class="histories one-on-one ${className}" id="player-winner-icon">
          <img class="histories one-on-one" src="${HISTORIES_IMAGE_PATH}/winner.png" alt="winner-icon">
        </div>
    `;
  };

  /**
   * 사용자 지정 모드의 전적 리스트를 렌더링합니다.
   * @param player { {nickname: string, avatar: string, rating: number, score: number, winner: boolean} } - 플레이어 정보
   * @returns { string } - 렌더링된 플레이어 정보
   */
  const renderPlayer = (player) => {
    return `
      <div class="histories one-on-one" id="player">
        ${renderWinnerIcon(player.winner)}
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

  const renderGameInfo = (start_time, playtime) => {
    return `
      <div class="histories one-on-one info-title" id="game-id">게임 번호</div>
      <div class="histories one-on-one info-data">${gameId}</div>
      <div class="histories one-on-one info-title" id="game-date">게임 날짜</div>
      <div class="histories one-on-one info-data">${start_time}</div>
      <div class="histories one-on-one info-title" id="game-playtime">게임 시간</div>
      <div class="histories one-on-one info-data">${playtime}</div>
    `;
  };

  const renderOneOnOneDetails = () => {
    const { player1, player2, start_time, playtime } =
      getOneOnOneHistoriesDetails();
    this.insertAdjacentHTML(
      "afterbegin",
      `
      <div class="histories one-on-one" id="details-wrapper">
        <div class="histories one-on-one" id="players">
            ${renderPlayer(player1)}
            <p class="histories" id="score-separator">:</p>
            ${renderPlayer(player2)}
        </div>
        <div class="histories one-on-one" id="game-info">
            ${renderGameInfo(start_time, playtime)}
        </div>
      </div>
    `,
    );
  };

  this.render = () => {
    renderOneOnOneDetails();
  };

  init();
  let [getOneOnOneHistoriesDetails, setOneOnOneHistoriesDetails] = useState(
    {},
    this,
    "render",
  );
}
