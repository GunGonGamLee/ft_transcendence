import {
  hoverChangeColor,
  hoverChangeCursor,
  hoverChangeFont,
  hoverToggle,
} from "../../utils/hoverEvent.js";
import { click } from "../../utils/clickEvent.js";
import { importCss } from "../../utils/importCss.js";
import Summary from "./summary-page.js";
import CustomHistories from "./custom-page.js";
import TournamentHistories from "./tournament-page.js";
import Ranking from "./ranking-page.js";

export default function Histories($container) {
  this.$container = $container;

  this.render = () => {
    this.renderLayout();
    this.renderList();
  };

  /**
   * 헤더, 그리고 개요-사용자 지정 모드-토너먼트 모드를 선택할 수 있는 버튼들을 렌더링합니다.
   * 이는 전적 리스트의 페이지의 레이아웃으로 추후 공통 모듈로 분리할 수 있습니다.
   */
  this.renderLayout = () => {
    importCss("../../../assets/css/histories.css");
    this.$container.insertAdjacentHTML(
      "afterbegin",
      `
        <div class="histories" id="content-wrapper">
            <nav class="histories" id="mode">
                <div class="histories" id="summary">
                    <img class="histories" src="../../../assets/images/custom_summary.png" alt="summary">
                    너의 기록은
                </div>
                <div class="histories" id="custom-menu-wrapper">
                    <div class="histories custom-toggle" id="custom">
                        <img class="histories" src="../../../assets/images/setting.png" alt="custom-mode">
                        사용자 지정 모드
                    </div>
                    <div class="histories custom-toggle" id="toggle">
                        <ul class="histories">
                            <li>1 vs 1 모드</li>
                            <li>토너먼트 모드</li>
                        </ul>
                    </div>
                </div>
               <div class="histories title" id="tournament">
                   <img class="histories" src="../../../assets/images/tournament_logo.png" alt="tournament">
                   토너먼트 모드
               </div>
            </nav>
            <div class="histories" id="content">
            </div>
            <footer class="histories">
                <div class="histories" id="search-wrapper">
                    <img class="histories" src="../../../assets/images/search.png" alt="search">
                    <input class="histories" id="search" type="text" placeholder="유저 검색">
                </div> 
                <div class="histories" id="pagination">
                    <img src="../../../assets/images/pagination.png" alt="prev" id="prev">
                    <img src="../../../assets/images/pagination.png" alt="next" id="next">
                </div>
            </footer>
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
    const $listWrapper = document.getElementById("list-wrapper");
    const $summary = document.getElementById("summary");
    const $customMenuWrapper = document.getElementById("custom-menu-wrapper");
    const $custom = document.getElementById("custom");
    const $toggleItems = Array.from(document.getElementsByTagName("li"));
    const $tournament = document.getElementById("tournament");
    const $prev = document.getElementById("prev");
    const $next = document.getElementById("next");

    // 폰트 색상 변경
    hoverChangeColor([$summary, $custom, $tournament], "#ffffff", "#29ABE2");
    hoverChangeColor($toggleItems, "#aaaaaa", "#29ABE2");

    // 폰트 변경
    hoverChangeFont(
      [$summary, $custom, $tournament],
      "Galmuri11, serif",
      "Galmuri11-Bold, serif",
    );

    // 커서 변경
    hoverChangeCursor(
      [$summary, $customMenuWrapper, $tournament, $prev, $next],
      "pointer",
    );

    // click 이벤트
    click($summary, Summary);
    click($custom, CustomHistories.bind($content, "1vs1"));
    click($tournament, TournamentHistories.bind($content, false));
    click($prev, function () {
      console.log("TODO => 이전 페이지로 이동");
    });
    click($next, function () {
      console.log("TODO => 다음 페이지로 이동");
    });
    click($toggleItems[0], CustomHistories.bind($content, "1vs1")); // 1 vs 1 모드 선택 시 실행
    click($toggleItems[1], TournamentHistories.bind($content, true)); // 토너먼트 모드 선택 시 실행

    // toggle 이벤트
    let $toggle = document.getElementById("toggle");
    hoverToggle($customMenuWrapper, $toggle, "flex");
    $customMenuWrapper.addEventListener("mouseover", () => {
      $customMenuWrapper.style.color = "#29ABE2";
    });
  };
  this.render();
  this.addEventListenersToLayout();
}
