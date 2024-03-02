import { BACKEND, HISTORIES_IMAGE_PATH } from "../../global.js";
import { navigate } from "../../utils/navigate.js";
import { getCookie } from "../../utils/cookie.js";
import useState from "../../utils/useState.js";
import { getUserMe } from "../../utils/userUtils.js";

export default function OneOnOneHistoriesDetails({ gameId }) {
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
