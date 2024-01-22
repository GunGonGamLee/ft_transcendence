import {hoverChangeColor, hoverChangeCursor, hoverChangeFont} from "../../utils/hoverEvent.js";
import {click} from "../../utils/clickEvent.js";
import { importCss } from '../../utils/importCss.js';
import Summary from "./summary-page.js";
import CustomHistories from "./custom-page.js";
import TournamentHistories from "./tournament-page.js";
import Ranking from "./ranking-page.js";


export default function Histories($container) {
    this.$container = $container;

    this.setState = () => {
        this.render();
    }

    this.render = () => {
        this.renderLayout();
        this.renderList();
    }

    /**
     * 헤더, 그리고 개요-사용자 지정 모드-토너먼트 모드를 선택할 수 있는 버튼들을 렌더링합니다.
     * 이는 전적 리스트의 페이지의 레이아웃으로 추후 공통 모듈로 분리할 수 있습니다.
     */
    this.renderLayout = () => {
        importCss('../../../assets/css/histories.css')
        this.$container.innerHTML = `
        <div class="histories" id="content-wrapper">
            <nav class="histories" id="mode">
                <div class="histories" id="summary" href="">
                    <img class="histories" src="../../../assets/images/custom_summary.png" alt="summary">
                    너의 기록은
                </div>
                <div class="histories title" id="custom" href="">
                    <img class="histories" src="../../../assets/images/setting.png" alt="custom-mode">
                    사용자 지정 모드
                </div>
               <div class="histories title" id="tournament" href="">
                   <img class="histories" src="../../../assets/images/tournament_logo.png" alt="tournament">
                   토너먼트 모드
               </div>
               <div class="histories title" id="ranking" href="">
                   <img class="histories" src="../../../assets/images/ranking.png" alt="tournament">
                   전체 랭킹 
               </div>
            </nav>
            <div class="histories" id="list"></div>
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
        `;
    }

    this.renderList = () => {
        new Summary(document.getElementById("list"));
    }

  /**
   * 레이아웃 엘리먼트에 이벤트 리스너를 추가합니다.
   */
  this.addEventListenersToLayout = () => {
        const $summary = document.getElementById("summary");
        const $custom = document.getElementById("custom");
        const $tournament = document.getElementById("tournament");
        const $ranking = document.getElementById("ranking");
        const $prev = document.getElementById("prev");
        const $next = document.getElementById("next");

        // 폰트 색상 변경
        hoverChangeColor($summary, "#ffffff", "#29ABE2");
        hoverChangeColor($custom, "#ffffff", "#29ABE2");
        hoverChangeColor($tournament, "#ffffff", "#29ABE2");
        hoverChangeColor($ranking, "#ffffff", "#29ABE2");

        // 폰트 변경
        hoverChangeFont($summary, "Galmuri11, serif", "Galmuri11-Bold, serif");
        hoverChangeFont($custom, "Galmuri11, serif", "Galmuri11-Bold, serif");
        hoverChangeFont($tournament, "Galmuri11, serif", "Galmuri11-Bold, serif");
        hoverChangeFont($ranking, "Galmuri11, serif", "Galmuri11-Bold, serif");

        // 커서 변경
        hoverChangeCursor($summary, "pointer");
        hoverChangeCursor($custom, "pointer");
        hoverChangeCursor($tournament, "pointer");
        hoverChangeCursor($ranking, "pointer");
        hoverChangeCursor($prev, "pointer");
        hoverChangeCursor($next, "pointer");

        // click 이벤트
        click($summary, Summary);
        click($custom, CustomHistories);
        click($tournament, TournamentHistories);
        click($ranking, Ranking);
        click($prev, function () {console.log("TODO => 이전 페이지로 이동")});
        click($next, function () {console.log("TODO => 다음 페이지로 이동")});
    }

    this.render();
    this.addEventListenersToLayout();
}
