import {click} from "../../utils/clickEvent.js"
import GameRoomList from "./game-room-list.js"
import {importCss} from '../../utils/importCss.js'
import roomCreateModal from './room-create-modal.js'
import {hoverToggle} from '../../utils/hoverEvent.js'


export default function CustomGameList($container) {
    this.$container = $container;

    this.setState = () => {
        this.render();
    }

    this.render = () => {
        this.renderLayout();
        this.renderList();
        this.renderRoomCreateModal();
    }

    this.renderLayout = () => {
        importCss('../../../assets/css/customGameList.css')
        this.$container.insertAdjacentHTML("afterbegin", `
            <div class="custom-game-list" id="content-wrapper">
                <div class="custom-game-list" id="game-room-list-wrapper">
                </div>
                <div class="custom-game-list" id="pagination-arrow-wrapper">
                    <a class="custom-game-list" id="pagination-arrow-left" style="color: rgb(255, 255, 255); font-family: Galmuri11, serif;">
                        <
                    </a>
                    <a class="custom-game-list" id="pagination-arrow-right" style="color: rgb(255, 255, 255); font-family: Galmuri11, serif;" role="button" >
                        >
                    </a>
                </div>
            </div>
            <footer class="custom-game-list" id="game-room-options-wrapper">
                    <a class="custom-game-list" id="quick-join" style="color: rgb(255, 255, 255); font-family: Galmuri11, serif;">신속히 입장</a>
                    <a class="custom-game-list" id="create-room" style="color: rgb(255, 255, 255); font-family: Galmuri11, serif;">방 만들기</a>
                    <a class="custom-game-list" id="room-filter" style="color: rgb(255, 255, 255); font-family: Galmuri11, serif;">
                        <div class="histories game-mode-toggle" id="toggle">
                            <ul class="histories">
                                <li>1 vs 1 모드</li>
                                <li>토너먼트 모드</li>
                            </ul>
                        </div>
                        <div class="custom-game-list" id="room-filter">
                            방 걸러보기
                        </div> 
                    </a>
            </footer>
        `)
    }

    this.renderList = () => {
        let $list = document.getElementById("game-room-list-wrapper");
        GameRoomList.bind($list)();
    }

    this.renderRoomCreateModal = () => {
        const modalHtml = roomCreateModal();
        this.$container.insertAdjacentHTML("beforeend", modalHtml);
    }

    this.addEventListenersToLayout = () => {
        const $roomContent = document.getElementById("room-content");
        const $paginationBefore = document.getElementById("pagination-arrow-left");
        const $paginationAfter = document.getElementById("pagination-arrow-right");
        const $createRoomButton = document.getElementById("create-room");
        const $roomCreateModal = document.getElementById("room-create-modal-wrapper");
        const $modalClose = document.getElementById("modal-close");
        const $roomSearchFilter = document.getElementById("room-filter");
        const $modeFilterToggle= document.getElementById("toggle")


        // 방만들기 모달 열기
        click($createRoomButton, () => {
            $roomCreateModal.style.display = "block";
        });

        // 방만들기 모달 닫기
        click($modalClose, () => {
            $roomCreateModal.style.display = "none";
        });

        // 방 걸러보기 토글
        hoverToggle($roomSearchFilter, $modeFilterToggle, 'block');
    }

    this.render();
    this.addEventListenersToLayout();
}