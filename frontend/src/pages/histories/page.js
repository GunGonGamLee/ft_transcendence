import { hoverToggle } from "../../utils/hoverEvent.js";
import { click } from "../../utils/clickEvent.js";
import { importCss } from "../../utils/importCss.js";
import { HISTORIES_IMAGE_PATH, MODE } from "../../global.js";
import OneOnOneHistoriesDetails from "./one-on-one-histories-details.js";
import TournamentHistoriesDetails from "./tournament-histories-details.js";
import { navigate } from "../../utils/navigate.js";
import Summary from "./summary-page.js";

export function Histories($container) {
  this.$container = $container;

  const init = () => {
    this.$container.textContent = "";
  };

  const render = () => {
    renderLayout();
  };

  const renderNav = () => {
    return `
        <nav class="histories">
            <div class="histories" id="summary">
                <img class="histories" src="${HISTORIES_IMAGE_PATH}/summary.png" alt="summary">
                너의 기록은
            </div>
            <div class="histories" id="casual-menu-wrapper">
                <div class="histories casual-toggle" id="casual">
                    <img class="histories" src="${HISTORIES_IMAGE_PATH}/setting.png" alt="casual-mode">
                    ${MODE.casual}
                </div>
                <div class="histories casual-toggle" id="toggle">
                    <ul class="histories">
                        <li>${MODE.one_on_one}</li>
                        <li>${MODE.rank}</li>
                    </ul>
                </div>
            </div>
           <div class="histories" id="tournament">
               <img class="histories" src="${HISTORIES_IMAGE_PATH}/tournament_logo.png" alt="tournament">
               ${MODE.rank}
           </div>
           <div class="histories" id="avatar">
                <img class="histories" src="${HISTORIES_IMAGE_PATH}/avatar_change.png" alt="avatar">
                아바타 변경
           </div>
        </nav>
        `;
  };

  const renderFooter = () => {
    return `
        <footer class="histories">
            <div class="histories" id="search-wrapper">
                <img class="histories" src="${HISTORIES_IMAGE_PATH}/search.png" alt="search">
                <input class="histories" id="search" type="text" placeholder="유저 검색">
            </div> 
            <div class="histories" id="pagination">
                <img src="${HISTORIES_IMAGE_PATH}/pagination.png" alt="prev" id="prev">
                <img src="${HISTORIES_IMAGE_PATH}/pagination.png" alt="next" id="next">
            </div>
        </footer>
        `;
  };

  /**
   * 헤더, 그리고 개요-캐주얼 모드-토너먼트 모드를 선택할 수 있는 버튼들을 렌더링합니다.
   * 이는 전적 리스트의 페이지의 레이아웃으로 추후 공통 모듈로 분리할 수 있습니다.
   */
  const renderLayout = () => {
    importCss("../../../assets/css/histories.css");
    this.$container.insertAdjacentHTML(
      "afterbegin",
      `
        <div class="histories" id="content-wrapper">
            ${renderNav()}
            <div class="histories" id="content">
            </div>
            ${renderFooter()}
        </div>
        `,
    );
  };

  /**
   * 레이아웃 엘리먼트에 이벤트 리스너를 추가합니다.
   */
  const addEventListenersToLayout = () => {
    const $summary = document.getElementById("summary");
    const $casualMenuWrapper = document.getElementById("casual-menu-wrapper");
    const $casual = document.getElementById("casual");
    const $toggleItems = Array.from(
      document.querySelectorAll(".histories .casual-toggle ul.histories li"),
    );
    const $tournament = document.getElementById("tournament");
    const $avatar = document.getElementById("avatar");
    const $search = document.getElementById("search");

    // click 이벤트
    click($summary, () => {
      navigate("/histories/summary");
    });
    click($casual, () => {
      navigate("/histories/casual/one-on-one", { mode: "casual_1vs1" });
    });
    click($tournament, () => {
      navigate("/histories/rank/tournament", { mode: "rank" });
    });
    click($avatar, () => {
      navigate("/avatar");
    });
    click($toggleItems[0], () => {
      navigate("/histories/casual/one-on-one", { mode: "casual_1vs1" });
    });
    click($toggleItems[1], () => {
      navigate("/histories/casual/tournament", {
        mode: "casual_tournament",
      });
    }); // 토너먼트 모드 선택 시 실행

    // toggle 이벤트
    let $toggle = document.getElementById("toggle");
    hoverToggle($casualMenuWrapper, $toggle, "flex");

    // 유저 검색 이벤트
    $search.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        new Summary(document.getElementById("app"), {
          nickname: $search.value,
        });
      }
    });
  };

  init();
  render();
  addEventListenersToLayout();
}

/**
 * 전적 리스트의 세부 정보를 렌더링합니다. 게임 모드에 따라 다른 컴포넌트를 렌더링합니다.
 * @param $container {HTMLElement} - 전적 리스트 페이지가 렌더링될 엘리먼트
 * @param info {{gameId: number}} - 게임 아이디가 포함된 객체
 * @constructor - 전적 리스트 페이지가 렌더링될 엘리먼트
 */
export function HistoriesDetails($container, info) {
  this.$container = $container;
  const queryString = location.search.split("?")[1]; // ? 제거
  const searchParams = new URLSearchParams(queryString);
  const mode = searchParams.get("mode");
  if (info === undefined) {
    info = { gameId: Number(searchParams.get("gameId")) };
  }
  Histories.bind(this, $container)();
  const $content = document.getElementById("content");

  switch (mode) {
    case "casual_1vs1":
      OneOnOneHistoriesDetails.bind($content, info.gameId)();
      break;
    case "casual_tournament":
    case "rank":
      TournamentHistoriesDetails.bind($content, info.gameId)();
      break;
    default:
      navigate("error", { errorCode: 404 });
  }
}
