import { addPaginationOnClickProperty } from "../../utils/pagination.js";
import { HISTORIES_IMAGE_PATH } from "../../global.js";

export default async function TournamentHistoriesDetails(id) {
  const init = () => {
    this.textContent = "";
    addPaginationOnClickProperty("prev", renderTournamentTree);
    addPaginationOnClickProperty("next", renderTournamentResult);
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
      finalData.winner === finalData.player1.nickname ? "visible" : "hidden";
    let winnerVisibilityOfPlayer2 =
      finalData.winner === finalData.player2.nickname ? "visible" : "hidden";
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
    init();
    let $treeWrapper = document.createElement("div");
    $treeWrapper.id = "tree-wrapper";
    $treeWrapper.className = "histories tournament";
    renderMatch($treeWrapper, this.state.match1);
    renderFinal($treeWrapper, this.state.match3);
    renderMatch($treeWrapper, this.state.match2);
    this.appendChild($treeWrapper);
  };

  /**
   * 토너먼트 결과를 반환합니다.
   * 1. match3의 승자를 기준으로 firstPlayer, secondPlayer를 정합니다.
   * 2. match1, match2의 player1, player2 중 match3의 플레이어가 아닌 플레이어를 others에 추가합니다.
   * @returns {{firstPlayer, secondPlayer, others: {}}} 토너먼트 결과
   */
  const getResult = () => {
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
    init();
    let $resultWrapper = document.createElement("div");
    $resultWrapper.id = "result-wrapper";
    $resultWrapper.className = "histories tournament";
    const result = getResult();
    renderResult(result, $resultWrapper);
    this.appendChild($resultWrapper);
    setPodiumHeight(4);
    renderWinnerIcon();
  };

  init();
}
