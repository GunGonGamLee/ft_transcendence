import {click} from "../../utils/clickEvent.js"
import GameRoomList from "./game-room-list.js"
import {importCss} from '../../utils/importCss.js'
import roomCreateModal from './room-create-modal.js'
import {hoverToggle} from '../../utils/hoverEvent.js'
import passwordModal from './password-modal.js'


export default function CustomGameList($container) {
    this.$container = $container;

    this.setState = () => {
        this.render();
    }

    this.render = () => {
        this.renderLayout();
        this.renderList();
        this.renderRoomCreateModal();
        this.renderPasswordModal();
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

    this.renderPasswordModal = () => {
        const modalHtml = passwordModal();
        this.$container.insertAdjacentHTML("beforeend", modalHtml);
    }

    this.addEventListenersToLayout = () => {
        const $roomContents = document.querySelectorAll(".game-room-list.room-info");
        const $paginationBefore = document.getElementById("pagination-arrow-left");
        const $paginationAfter = document.getElementById("pagination-arrow-right");
        const $createRoomButton = document.getElementById("create-room");
        const $roomCreateModal = document.getElementById("room-create-modal-wrapper");
        const $modalClose = document.getElementById("modal-close");
        const $roomSearchFilter = document.getElementById("room-filter");
        const $modeFilterToggle= document.getElementById("toggle");
        const $passwordModal = document.getElementById("password-modal-wrapper");
        const $passwordModalClose = document.getElementById("password-modal-close");


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

        // 대기중 && 자물쇠가 걸려있는 방 일때 패스워드 모달 열기
        // roomContant에 마우스가 들어갈 떄 hover event 적용
        $roomContents.forEach($roomContent => {
            click($roomContent, () => {
                const $roomWrapper = $roomContent.closest('.room-wrapper');

                // isSecret: '.is-secret' 클래스를 가진 요소의 존재 여부로 판단
                const isSecret = $roomWrapper.querySelector('.is-secret') !== null;

                // isWaiting: roomStatus 요소의 텍스트 내용으로 '대기중'인지 판단
                const roomStatusElement = $roomWrapper.querySelector('.room-status');
                const isWaiting = roomStatusElement && roomStatusElement.textContent.trim() === '대기중';

                // 비밀방이며 대기중인 경우, 패스워드 모달을 표시
                if (isSecret && isWaiting) {
                    $passwordModal.style.display = "block";
                }
            });

            // mouseenter 이벤트 리스너
            $roomContent.addEventListener('mouseenter', function() {
                const style = window.getComputedStyle(this);
                const borderColor = style.borderColor;

                // RGB 색상에서 RGBA 색상으로 변환하여 배경색으로 설정 (20% 투명도 적용)
                const backgroundColor = borderColor.replace('rgb', 'rgba').replace(')', ', 0.2)');
                this.style.backgroundColor = backgroundColor;
            });

            // mouseleave 이벤트 리스너
            $roomContent.addEventListener('mouseleave', function() {
                this.style.backgroundColor = ''; // 배경색을 초기화 (CSS 스타일로 돌아감)
            });
        });

        // 패스워드 모달 닫기
        click($passwordModalClose, () => {
            $passwordModal.style.display = "none";
        });

    }

    this.render();
    this.addEventListenersToLayout();
}