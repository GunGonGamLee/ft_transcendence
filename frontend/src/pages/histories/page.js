import { hoverToggle } from "../../utils/hoverEvent.js";
import { click } from "../../utils/clickEvent.js";
import { importCss } from "../../utils/importCss.js";
import Summary from "./summary-page.js";
import CustomHistories from "./casual-page.js";
import TournamentHistories from "./tournament-page.js";
import { HISTORIES_IMAGE_PATH, MODE } from "../../global.js";

export default function Histories($container) {
  this.$container = $container;

  this.render = () => {
    this.renderLayout();
    this.renderList();
  };

  this.renderNav = () => {
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
                        <li>${MODE.tournament}</li>
                    </ul>
                </div>
            </div>
           <div class="histories title" id="tournament">
               <img class="histories" src="${HISTORIES_IMAGE_PATH}/tournament_logo.png" alt="tournament">
               ${MODE.tournament}
           </div>
        </nav>
        `;
  };

  this.renderFooter = () => {
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
  this.renderLayout = () => {
    importCss("../../../assets/css/histories.css");
    this.$container.insertAdjacentHTML(
      "afterbegin",
      `
        <div class="histories" id="content-wrapper">
            ${this.renderNav()}
            <div class="histories" id="content">
            </div>
            ${this.renderFooter()}
        </div>
        `,
    );
  };

  this.renderList = () => {
    let $content = document.getElementById("content");
    Summary.bind($content)();
  };

  /**
   * 레이아웃 엘리먼트에 이벤트 리스너를 추가합니다.
   */
  this.addEventListenersToLayout = () => {
    const $content = document.getElementById("content");
    const $summary = document.getElementById("summary");
    const $casualMenuWrapper = document.getElementById("casual-menu-wrapper");
    const $casual = document.getElementById("casual");
    const $toggleItems = Array.from(document.getElementsByTagName("li"));
    const $tournament = document.getElementById("tournament");

    // click 이벤트
    click($summary, Summary);
    click($casual, CustomHistories.bind($content, "1vs1"));
    click($tournament, TournamentHistories.bind($content, false));
    click($toggleItems[0], CustomHistories.bind($content, "1vs1")); // 1 vs 1 모드 선택 시 실행
    click($toggleItems[1], TournamentHistories.bind($content, true)); // 토너먼트 모드 선택 시 실행

    // toggle 이벤트
    let $toggle = document.getElementById("toggle");
    hoverToggle($casualMenuWrapper, $toggle, "flex");
  };
  this.render();
  this.addEventListenersToLayout();
}
