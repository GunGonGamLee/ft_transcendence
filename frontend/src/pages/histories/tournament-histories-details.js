import {
  initializePagination,
  setPaginationActive,
} from "../../utils/pagination.js";
import { BACKEND, HISTORIES_IMAGE_PATH } from "../../global.js";
import useState from "../../utils/useState.js";
import { navigate } from "../../utils/navigate.js";
import { getCookie } from "../../utils/cookie.js";

export default function TournamentHistoriesDetails(gameId) {
  const init = () => {
    this.textContent = "";
    this.$pagination = document.getElementById("pagination");
    this.$prev = document.getElementById("prev");
    this.$next = document.getElementById("next");
    initializePagination(this.$pagination, this.$prev, this.$next);
    fetch(`${BACKEND}/games/results/${gameId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("jwt")}`,
      },
    }).then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          setTournamentHistoriesDetails(data);
        });
      } else {
        navigate("error", { errorCode: response.status });
      }
    });
  };

  this.render = () => {
    renderTournamentTree();
  };

  /**
   * 토너먼트 대진표에서 경기를 렌더링합니다.
   * @param $treeWrapper {HTMLElement} 대진표를 렌더링할 wrapper
   * @param matchData {object} 경기 정보
   */
  const renderMatch = ($treeWrapper, matchData) => {
    let $match = document.createElement("div");
    $match.className = "histories tournament match";
    $match.insertAdjacentHTML(
      "afterbegin",
      `
            <div class="histories tournament match player1">
                <img src="${HISTORIES_IMAGE_PATH}/avatar/${matchData.player1.avatar}" alt="avatar">
                <div class="histories tournament match nickname">
                    ${matchData.player1.nickname}
                </div>
                <div class="histories tournament match rating">
                    Rating: ${matchData.player1.rating}
                </div>
            </div>
            <div class="histories tournament match player2">
                <img src="${HISTORIES_IMAGE_PATH}/avatar/${matchData.player2.avatar}" alt="avatar">
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

  /**
   * 결승전의 승리 아이콘을 렌더링합니다.
   * @param finalData {object} 결승전 정보
   * @returns {string} 결승전의 승리 아이콘을 렌더링하는 HTML
   */
  const renderFinalWinner = (finalData) => {
    let winnerVisibilityOfPlayer1 =
      finalData["winner"] === finalData.player1.nickname ? "visible" : "hidden";
    let winnerVisibilityOfPlayer2 =
      finalData["winner"] === finalData.player2.nickname ? "visible" : "hidden";
    return `
    <div class="histories tournament final winner">
        <img src="${HISTORIES_IMAGE_PATH}/winner.png" alt="winner" style="visibility: ${winnerVisibilityOfPlayer1}">
    </div>
    <div></div>
    <div class="histories tournament final winner">
        <img src="${HISTORIES_IMAGE_PATH}/winner.png" alt="winner" style="visibility: ${winnerVisibilityOfPlayer2}">
    </div>
    `;
  };

  /**
   * 토너먼트 대진표에서 결승전의 플레이어 정보를 렌더링합니다.
   * @param finalData {object} 결승전 정보
   * @returns {string} 결승전의 플레이어 정보를 렌더링하는 HTML
   */
  const renderTournamentPlayers = (finalData) => {
    return `
    <div class="histories tournament final player1">
        <img src="${HISTORIES_IMAGE_PATH}/avatar/${finalData.player1.avatar}" alt="avatar">
        <div class="histories tournament nickname">
            ${finalData.player1.nickname}
        </div>
        <div class="histories tournament match rating">
            Rating: ${finalData.player1.rating}
        </div>
    </div>
    <div class="histories tournament final trophy">
        <img src="${HISTORIES_IMAGE_PATH}/tournament_logo.png" alt="tournament_logo">
    </div>
    <div class="histories tournament final player2">
        <img src="${HISTORIES_IMAGE_PATH}/avatar/${finalData.player2.avatar}" alt="avatar">
        <div class="histories tournament match nickname">
            ${finalData.player2.nickname}
        </div>
        <div class="histories tournament match rating">
            Rating: ${finalData.player2.rating}
        </div>
    </div>
    `;
  };

  /**
   * 토너먼트 대진표에서 결승전을 렌더링합니다.
   * @param $treeWrapper {HTMLElement} 대진표를 렌더링할 wrapper
   * @param finalData {object} 결승전 정보
   */
  const renderFinal = ($treeWrapper, finalData) => {
    if (finalData === null) {
      finalData = {
        player1: {
          avatar: "anonymous.png",
          nickname: "",
          rating: "?",
        },
        player2: {
          avatar: "anonymous.png",
          nickname: "",
          rating: "?",
        },
      };
    }
    let $final = document.createElement("div");
    $final.className = "histories tournament";
    $final.id = "final";
    $final.insertAdjacentHTML(
      "afterbegin",
      `
            ${renderFinalWinner(finalData)}
            ${renderTournamentPlayers(finalData)}
    `,
    );
    $treeWrapper.appendChild($final);
  };

  /**
   * 토너먼트 대진표를 렌더링합니다.
   */
  const renderTournamentTree = () => {
    setPaginationActive(this.$prev, false, renderTournamentTree);
    setPaginationActive(this.$next, true, renderTournamentResult);
    this.textContent = "";
    let $treeWrapper = document.createElement("div");
    $treeWrapper.id = "tree-wrapper";
    $treeWrapper.className = "histories tournament";
    const { match1, match2, match3 } = getTournamentHistoriesDetails();
    renderMatch($treeWrapper, match1);
    renderFinal($treeWrapper, match3);
    renderMatch($treeWrapper, match2);
    this.appendChild($treeWrapper);
    removeRatingForAnonymous();
  };

  /**
   * 게임 중인 토너먼트의 결과를 반환합니다. match3가 null인 경우에 호출됩니다.
   * @param match1 {object}
   * @param match2 {object}
   * @returns {object} 토너먼트 결과
   */
  const getResultInGame = (match1, match2) => {
    let result = {
      firstPlayer: {
        nickname: "",
        avatar: "anonymous.png",
        rating: "?",
      },
      secondPlayer: {
        nickname: "",
        avatar: "anonymous.png",
        rating: "?",
      },
      others: {
        player1: {},
        player2: {},
      },
    };
    let anonymous = {
      nickname: "",
      avatar: "anonymous.png",
      rating: "?",
    };
    if (match1.player1.score === null && match1.player2.score === null) {
      // match1의 결과가 없는 경우
      result.others.player1 =
        match2.player1.score > match2.player2.score
          ? match2.player2
          : match2.player1;
      result.others.player2 = anonymous;
    } else if (match2.player1.score === null && match2.player2.score === null) {
      // match2의 결과가 없는 경우
      result.others.player1 =
        match1.player1.score > match1.player2.score
          ? match1.player2
          : match1.player1;
      result.others.player2 = anonymous;
    } else {
      // match1, match2의 결과가 모두 있는 경우
      result.others.player1 =
        match1.player1.score < match1.player2.score
          ? match1.player1
          : match1.player2;
      result.others.player2 =
        match2.player1.score < match2.player2.score
          ? match2.player1
          : match2.player2;
    }
    return result;
  };

  /**
   * 토너먼트 결과를 반환합니다.
   * 1. match3의 승자를 기준으로 firstPlayer, secondPlayer를 정합니다.
   * 2. match1, match2의 player1, player2 중 match3의 플레이어가 아닌 플레이어를 others에 추가합니다.
   * @returns {{firstPlayer, secondPlayer, others: {}}} 토너먼트 결과
   */
  const getResult = () => {
    const { match1, match2, match3 } = getTournamentHistoriesDetails();
    if (match3 === null) {
      return getResultInGame(match1, match2);
    }
    let firstPlayer,
      secondPlayer,
      others = {};
    if (match3["winner"] === match3.player1.nickname) {
      firstPlayer = match3.player1;
      secondPlayer = match3.player2;
    } else {
      firstPlayer = match3.player2;
      secondPlayer = match3.player1;
    }
    const finalPlayerNicknames = [
      match3.player1.nickname,
      match3.player2.nickname,
    ];
    finalPlayerNicknames.includes(match1.player1.nickname) === false
      ? (others.player1 = match1.player1)
      : (others.player1 = match1.player2);
    finalPlayerNicknames.includes(match2.player1.nickname) === false
      ? (others.player2 = match2.player1)
      : (others.player2 = match2.player2);
    return {
      firstPlayer,
      secondPlayer,
      others,
    };
  };

  /**
   * 토너먼트에 참가한 사용자 정보를 렌더링합니다.
   * @param playerInfo {object} 토너먼트 참가자 정보
   * @returns {string} 토너먼트 참가자 정보를 렌더링하는 HTML
   */
  const renderTournamentPlayer = (playerInfo) => {
    return `
        <div class="histories tournament result final-player">
            <img src="${HISTORIES_IMAGE_PATH}/avatar/${playerInfo.avatar}" alt="avatar" class="result avatar">
            <div class="histories tournament result nickname">
                ${playerInfo.nickname}
            </div>
            <div class="histories tournament result rating">
                Rating: ${playerInfo.rating}
            </div>
        </div>
    `;
  };

  /**
   * 토너먼트 결과에 따라 podium의 높이를 설정합니다.
   * @param constant {number} podium의 높이를 설정하는 상수
   */
  const setPodiumHeight = (constant) => {
    const $firstPodium = document.getElementById("first-podium");
    const $secondPodium = document.getElementById("second-podium");
    const $othersPodium = document.getElementById("others-podium");

    $firstPodium.style.height = constant * 3 + "vh";
    $secondPodium.style.height = constant * 2 + "vh";
    $othersPodium.style.height = constant + "vh";
  };

  /**
   * 토너먼트 결과에 대해 플레이어의 정보와 등 수를 함께 렌더링합니다.
   * @param result {object} 토너먼트 결과
   * @param $resultWrapper {HTMLElement}토너먼트 결과를 렌더링할 wrapper
   */
  const renderResult = (result, $resultWrapper) => {
    $resultWrapper.insertAdjacentHTML(
      "afterbegin",
      `
      <div class="histories tournament result-column">
        <div class="result-column rating">2등</div>
        ${renderTournamentPlayer(result.secondPlayer)}
        <div class="histories podium" id="second-podium"></div>
      </div>
      <div class="histories tournament result-column">
        <div class="result-column rating first-place">1등</div>
        ${renderTournamentPlayer(result.firstPlayer)}
        <div class="histories podium" id="first-podium"></div>
      </div>
      <div class="histories tournament result-column">
        <div class="result-column rating">그 외</div>
        <div class="histories tournament result others">
            ${renderTournamentPlayer(result.others.player1)}
            ${renderTournamentPlayer(result.others.player2)}
        </div>
        <div class="histories podium" id="others-podium"></div>
      </div>
    `,
    );
  };

  /**
   * 1등 아이콘을 렌더링합니다.
   */
  const renderWinnerIcon = () => {
    let $firstPlace = document.querySelector(".first-place");
    $firstPlace.insertAdjacentHTML(
      "beforebegin",
      `
        <img src="${HISTORIES_IMAGE_PATH}/winner.png" alt="winner" class="winner-icon">
        `,
    );
  };

  /**
   * 토너먼트 결과를 렌더링합니다.
   */
  const renderTournamentResult = () => {
    setPaginationActive(this.$prev, true, renderTournamentTree);
    setPaginationActive(this.$next, false, renderTournamentResult);
    this.textContent = "";
    let $resultWrapper = document.createElement("div");
    $resultWrapper.id = "result-wrapper";
    $resultWrapper.className = "histories tournament";
    const result = getResult();
    renderResult(result, $resultWrapper);
    this.appendChild($resultWrapper);
    setPodiumHeight(4);
    renderWinnerIcon();
    removeRatingForAnonymous();
  };

  /**
   * 익명 사용자의 rating을 제거합니다.
   */
  const removeRatingForAnonymous = () => {
    let $ratings = document.getElementsByClassName(
      "histories tournament rating",
    );
    console.log($ratings);
    for (let $rating of $ratings) {
      if ($rating.textContent.trim() === "Rating: ?") {
        $rating.style.display = "none";
      }
    }
  };

  init();
  let [getTournamentHistoriesDetails, setTournamentHistoriesDetails] = useState(
    {},
    this,
    "render",
  );
}
