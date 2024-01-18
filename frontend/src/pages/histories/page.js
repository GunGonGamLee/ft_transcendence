import {hoverChangeBorder, hoverChangeColor, hoverChangeCursor, hoverChangeFont} from "../../utils/hoverEvent.js";
import {click} from "../../utils/clickEvent.js";

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
        if (document.getElementsByTagName("head") !== null) {
            document.getElementsByTagName("head")[0].insertAdjacentHTML(
                "beforeend",
                '<link rel="stylesheet" href="../../../assets/css/histories.css"/>'
            );
        }
        this.$container.innerHTML = `
        <div class="histories" id="content-wrapper">
            <div class="histories" id="list"></div>
            <div class="histories" id="pagination">
                <div href="" class="histories" id="prev">
                    <img src="../../../assets/images/pagination.png" alt="prev">
                </div>
                <div href="" class="histories" id="next">
                    <img src="../../../assets/images/pagination.png" alt="next">
                </div>
            </div>
            <div class="histories" id="mode">
                <div class="histories" id="summary" href="">
                    <img class="histories" src="../../../assets/images/custom_summary.png" alt="summary">
                    개요
                </div>
                <div class="histories title" id="custom" href="">
                    <img class="histories" src="../../../assets/images/setting.png" alt="custom-mode">
                    사용자 지정 모드
                </div>
               <div class="histories title" id="tournament" href="">
                   <img class="histories" src="../../../assets/images/tournament_logo.png" alt="tournament">
                   토너먼트 모드
               </div>
            </div>
        </div>
        `;
    }

    /**
     * 사용자 지정 모드의 전적 리스트를 렌더링합니다.
     * 1. 플레이어 1의 정보를 렌더링합니다.
     * 2. 게임 모드(1 vs 1 로고 또는 토너먼트 로고)를 렌더링합니다.
     * 3. 플레이어 2의 정보를 렌더링합니다.
     */
    this.renderList = () => {
        let list = document.getElementById("list");
        list.innerHTML = `
        <div class="histories" id="list-wrapper"></div>
        `
        let listWrapper = document.getElementById("list-wrapper");
        listWrapper.innerHTML = '';
        let mockData = [
            {
                player1: {
                    nickname: "hyojocho",
                    avatar: "../../../assets/images/avatar/red.png",
                    rating: 2130,
                    is_winner: true,
                },
                player2: {
                    nickname: "yena",
                    avatar: "../../../assets/images/avatar/blue.png",
                    rating: 110,
                    is_winner: false,
                },
            },
            {
                player1: {
                    nickname: "hyojocho",
                    avatar: "../../../assets/images/avatar/red.png",
                    rating: 2130,
                    is_winner: true,
                },
                player2: {
                    nickname: "yena",
                    avatar: "../../../assets/images/avatar/blue.png",
                    rating: 110,
                    is_winner: false,
                },
            },
            {
                player1: {
                    nickname: "hyojocho",
                    avatar: "../../../assets/images/avatar/red.png",
                    rating: 2130,
                    is_winner: true,
                },
                player2: {
                    nickname: "yena",
                    avatar: "../../../assets/images/avatar/blue.png",
                    rating: 110,
                    is_winner: false,
                },
            },
            {
                player1: {
                    nickname: "hyojocho",
                    avatar: "../../../assets/images/avatar/red.png",
                    rating: 2130,
                    is_winner: true,
                },
                player2: {
                    nickname: "donghyk2",
                    avatar: "../../../assets/images/avatar/green.png",
                    rating: 2120,
                    is_winner: false,
                },
            },
        ]; // TODO: 백엔드로부터 데이터 받아오기
        for (let data of mockData) {
            const listItemDiv = document.createElement("div");
            listItemDiv.className = "histories list-item";
            this.renderPlayer(listItemDiv, data.player1);
            this.renderGameMode(listItemDiv);
            this.renderPlayer(listItemDiv, data.player2);
            hoverChangeBorder(listItemDiv, "3px solid transparent", "3px solid #29ABE2");
            hoverChangeCursor(listItemDiv, "pointer");
            listItemDiv.addEventListener("click", () => {
              console.log("TODO => 전적 상세 페이지로 이동")
            });
            listWrapper.appendChild(listItemDiv);
        }
    }

    /**
     * 전적 리스트의 플레이어 정보를 렌더링합니다.
     * @param listItemDiv 전적 리스트의 플레이어 정보를 렌더링할 리스트 아이템 <div> 엘리먼트
     * @param data 전적 리스트의 플레이어 정보
     */
    this.renderPlayer = (listItemDiv, data) => {
        const playerDiv = document.createElement("div");
        playerDiv.className = "histories player";
        playerDiv.innerHTML = `
        <div class="histories avatar">
            <img class="histories" src="${data.avatar}" alt="player1-avatar">
        </div>
        <div class="histories nickname">${data.nickname}</div>
        <div class="histories rating">Rating: ${data.rating}</div>
        `;
        listItemDiv.appendChild(playerDiv);
    }

    /**
     * 전적 리스트의 게임 모드(1 vs 1 로고 또는 토너먼트 로고)를 렌더링합니다.
     * @param listItemDiv 전적 리스트의 게임 모드를 렌더링할 리스트 아이템 <div> 엘리먼트
     */
    this.renderGameMode = (listItemDiv) => {
        const gameModeDiv = document.createElement("div");
        gameModeDiv.className = "histories game-mode";
        gameModeDiv.innerHTML = `
        <img class="histories" src="../../../assets/images/1vs1_logo.png" alt="1v1">
        `;
        listItemDiv.appendChild(gameModeDiv);
    }

  /**
   * 레이아웃 엘리먼트에 이벤트 리스너를 추가합니다.
   */
  this.addEventListenersToLayout = () => {
        const summary = document.getElementById("summary");
        const custom = document.getElementById("custom");
        const tournament = document.getElementById("tournament");
        const prev = document.getElementById("prev");
        const next = document.getElementById("next");

        // 폰트 색상 변경
        hoverChangeColor(summary, "#ffffff", "#29ABE2");
        hoverChangeColor(custom, "#ffffff", "#29ABE2");
        hoverChangeColor(tournament, "#ffffff", "#29ABE2");

        // 폰트 변경
        hoverChangeFont(summary, "Galmuri11, serif", "Galmuri11-Bold, serif");
        hoverChangeFont(custom, "Galmuri11, serif", "Galmuri11-Bold, serif");
        hoverChangeFont(tournament, "Galmuri11, serif", "Galmuri11-Bold, serif");

        // 커서 변경
        hoverChangeCursor(summary, "pointer");
        hoverChangeCursor(custom, "pointer");
        hoverChangeCursor(tournament, "pointer");
        hoverChangeCursor(prev, "pointer");
        hoverChangeCursor(next, "pointer");

        // click 이벤트
        click(summary, function () {console.log("TODO => 개요 페이지로 이동")});
        click(custom, function () {console.log("TODO => 사용자 지정 모드 페이지로 이동")});
        click(tournament, function () {console.log("TODO => 토너먼트 모드 페이지로 이동")});
        click(prev, function () {console.log("TODO => 이전 페이지로 이동")});
        click(next, function () {console.log("TODO => 다음 페이지로 이동")});
    }

    this.render();
    this.addEventListenersToLayout();
}
