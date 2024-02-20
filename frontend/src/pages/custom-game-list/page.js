import {click} from "../../utils/clickEvent.js"
import {importCss} from '../../utils/importCss.js'
import roomCreateModal from './room-create-modal.js'
import {hoverToggle} from '../../utils/hoverEvent.js'
import passwordModal from './password-modal.js'


export default function CustomGameList($container) {
    const init = () => {
        renderLayout();
        renderList();
        renderRoomCreateModal();
        renderPasswordModal();
    }

    const renderLayout = () => {
        importCss('../../../assets/css/customGameList.css')

        $container.innerHTML = `
            <div class="custom-game-list" id="content-wrapper">
                <div class="custom-game-list" id="game-room-list-wrapper">
                </div>
                <div class="custom-game-list" id="pagination-arrow-wrapper">
                    <div class="custom-game-list" id="pagination-arrow-left" style="color: rgb(255, 255, 255); font-family: Galmuri11, serif;">
                        <
                    </div>
                    <div class="custom-game-list" id="pagination-arrow-right" style="color: rgb(255, 255, 255); font-family: Galmuri11, serif;" role="button" >
                        >
                    </div>
                </div>
            </div>
            <footer class="custom-game-list" id="game-room-options-wrapper">
                    <div class="custom-game-list" id="quick-join" style="color: rgb(255, 255, 255); font-family: Galmuri11, serif;">신속히 입장</div>
                    <div class="custom-game-list" id="create-room" style="color: rgb(255, 255, 255); font-family: Galmuri11, serif;">방 만들기</div>
                    <div class="custom-game-list" id="room-filter" style="color: rgb(255, 255, 255); font-family: Galmuri11, serif;">
                        <div class="histories game-mode-toggle" id="toggle">
                            <ul class="histories">
                                <li>1 vs 1 모드</li>
                                <li>토너먼트 모드</li>
                            </ul>
                        </div>
                        <div class="custom-game-list" id="room-filter">
                            방 걸러보기
                        </div> 
                    </div>
            </footer>
        `;
    }

    // 임시 gameRoomList 오브젝트
    let gameRoomList = [
        {
            room: {
                gameMode: "1 vs 1",
                gameModeImage: "../../../assets/images/1vs1_logo.png",
                countOfPlayers: "1/2",
                roomTitle: "핑포로로로롱",
                roomStatus: "대기중",
                isSecret: "../../assets/images/password.png"
            },
        },
        {
            room: {
                gameMode: "1 vs 1",
                gameModeImage: "../../../assets/images/1vs1_logo.png",
                countOfPlayers: "2/2",
                roomTitle: "너만 오면 ㄱ",
                roomStatus: "게임중",
                isSecret: "../../assets/images/password.png"
            },
        },
        {
            room: {
                gameMode: "토너먼트",
                gameModeImage: "../../../assets/images/tournament_logo.png",
                roomTitle: "Im king of pingpong lalalalaalalalala",
                countOfPlayers: "1/4",
                roomStatus: "대기중"
            },
        },
        {
            room: {
                gameMode: "토너먼트",
                gameModeImage: "../../../assets/images/tournament_logo.png",
                roomTitle: "다 뎀비라!",
                countOfPlayers: "4/4",
                roomStatus: "게임중"
            }
        }
    ];

    /**
     * 비밀방 여부에 따른 HTML 문자열을 반환합니다.
     * @param room {object} 게임 방의 정보
     * @returns {string} 비밀방 여부에 따른 HTML 문자열
     */
    let getSecretRoomHTML = (room) => {
        return room.isSecret ?
            `<div class="game-room-list is-secret">
                <img class="game-room-list" src="${room.isSecret}" alt="is-secret">
             </div>` : '';
    };

    /**
     * 방 상태에 따른 스타일(테두리 색상과 텍스트 색상)을 반환합니다.
     * @param room {object} 게임 방의 정보
     * @returns {object} 스타일 정보를 담은 객체
     */
    let getRoomStyle = (room) => {
        let borderColor = room.roomStatus === "대기중" ? "#08F6B0" : "#FF79C5";
        let textColor = borderColor; // 텍스트 색상을 테두리 색상과 동일하게 설정
        // HEX 색상에서 RGB 값으로 변환
        let r = parseInt(borderColor.substring(1, 3), 16);
        let g = parseInt(borderColor.substring(3, 5), 16);
        let b = parseInt(borderColor.substring(5, 7), 16);

        // RGBA 그림자 색상 생성
        let shadowColor = `rgba(${r}, ${g}, ${b}, 0.3)`; // 0.3은 투명도

        return { borderColor, textColor, shadowColor };

    };

    /**
     * 게임 방의 정보를 렌더링합니다.
     * @param room {object} 게임 방의 정보
     * @returns {string} 게임 방의 정보를 렌더링한 HTML 문자열
     */
    let renderRoom = (room) => {
        let isSecretHTML = getSecretRoomHTML(room);
        let { borderColor, textColor, shadowColor } = getRoomStyle(room);

        return `
            <div class="game-room-list room-info" id="room-content" style="color: rgb(255, 255, 255); font-family: Galmuri11, serif; border: 1px solid ${borderColor}; box-shadow: 0 0 1rem 0.5rem ${shadowColor}; border-radius: 10px; width: 100%;">
                <div class="game-room-list column">
                    <div class="game-room-list game-mode">
                        <img class="game-room-list" id= "game-mode-image" src="${room.gameModeImage}" alt="game-mode">
                    </div>
                </div>
                <div class="game-room-list column">
                    <div class="game-room-list row">
                        <div class="game-room-list room-title">
                            ${room.roomTitle}
                        </div>
                        ${isSecretHTML}
                    </div>
                    <div class="game-room-list row">
                        <div class="game-room-list count-of-players">
                            ${room.countOfPlayers}
                        </div>
                        <div class="game-room-list game-mode-name">
                            ${room.gameMode}
                        </div>
                        <div class="game-room-list room-status" style="color: ${textColor};">
                            ${room.roomStatus}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 사용자 지정 게임 방의 게임 방 리스트를 렌더링합니다.
     * @param $listWrapper {HTMLElement} 게임 방 리스트를 렌더링할 <div> 엘리먼트
     */
    let renderGameRoomList = ($listWrapper) => {
        for (let data of gameRoomList) {
            const {room} = data;
            $listWrapper.insertAdjacentHTML("afterbegin", `
                <div class="game-room-list room-wrapper">
                    ${renderRoom(room)}
                </div>
            `);
        }
    }

    /**
     * 사용자 지정 모드의 게임 방 리스트를 렌더링합니다.
     * 현재 생성되어 있는 게임 방의 리스트를 렌더링합니다.
     */
    const renderList = () => {
        let $list = document.getElementById("game-room-list-wrapper");

        $list.innerHTML = `
            <div class="game-room-list" id="list-wrapper"></div>
            `;

        let $listWrapper = document.getElementById("list-wrapper");

        renderGameRoomList($listWrapper);
    }

    const renderRoomCreateModal = () => {
        const modalHtml = roomCreateModal();
        $container.insertAdjacentHTML("beforeend", modalHtml);
    }

    const renderPasswordModal = () => {
        const modalHtml = passwordModal();
        $container.insertAdjacentHTML("beforeend", modalHtml);
    }

    const addEventListenersToLayout = () => {
        // querySelectorAll로 룸 리스트 각각의 요소들을 담은 변수
        const $roomContents = document.querySelectorAll(".game-room-list.room-info");
        // 아직 사용하지는 않았지만 페이지네이션 오른쪽, 왼쪽 요소를 담고 있는 변수
        const $paginationBefore = document.getElementById("pagination-arrow-left");
        const $paginationAfter = document.getElementById("pagination-arrow-right");
        // 방만들기 버튼 요소
        const $createRoomButton = document.getElementById("create-room");
        // 방만들기 모달 요소
        const $roomCreateModal = document.getElementById("room-create-modal-wrapper");
        // 방만들기 모달 닫기 아이콘
        const $roomCreateModalClose = document.getElementById("room-create-modal-close");
        // 걸러보기 아이콘
        const $roomSearchFilter = document.getElementById("room-filter");
        // 걸러보기 토글
        const $modeFilterToggle= document.getElementById("toggle");
        // 패스워드 모달 요소
        const $passwordModal = document.getElementById("password-modal-wrapper");
        // 패스워드 모달 닫기 아이콘
        const $passwordModalClose = document.getElementById("password-modal-close");


        // 방만들기 모달 열기
        click($createRoomButton, () => {
            $roomCreateModal.style.display = "block";
        });

        // 방만들기 모달 닫기
        click($roomCreateModalClose, () => {
            $roomCreateModal.style.display = "none";
        });

        // 방 걸러보기 토글
        hoverToggle($roomSearchFilter, $modeFilterToggle, 'block');

        // 대기중 && 자물쇠가 걸려있는 방 일때 패스워드 모달 열기
        // roomContant에 마우스가 들어갈 떄 hover event 적용
        $roomContents.forEach($roomContent => {
            click($roomContent, () => {
                const $roomWrapper = $roomContent.closest('.room-wrapper');

                // isSecret: '.is-secret' 클래스를 가진 요소의 존재 여부로 비밀방인지 판단
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

                // 수정된 부분: 요소의 style 속성에 직접 backgroundColor 설정
                this.style.backgroundColor = backgroundColor;
            });

            // mouseleave 이벤트 리스너
            $roomContent.addEventListener('mouseleave', function() {
                // 배경색을 원래 상태(투명)로 되돌림
                this.style.backgroundColor = ''; // 또는 초기 설정한 배경색으로 지정
            });
        });

        // 패스워드 모달 닫기
        click($passwordModalClose, () => {
            $passwordModal.style.display = "none";
        });

    }

    init();
    addEventListenersToLayout();
}