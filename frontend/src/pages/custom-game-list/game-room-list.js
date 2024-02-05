/**
 * 사용자 지정 모드의 게임 방 리스트를 렌더링합니다.
 * @constructor 게임 방 리스트의 게임 모드
 */
export default function GameRoomList() {
    this.useState = async () => {
        // TODO => backend로부터 데이터 받아오기
        this.state = [
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
    }
    
    /**
     * 사용자 지정 모드의 게임 방 리스트를 렌더링합니다.
     * 1. 현재 생성되어 있는 게임 방의 리스트를 렌더링합니다.
     * 2. 페이지네이션 화살표를 렌더링합니다.
     */
    this.render = () => {
        this.insertAdjacentHTML("afterbegin", `
            <div class="game-room-list" id="list-wrapper"></div>
            `);
        let $listWrapper = document.getElementById("list-wrapper");
        this.renderGameRoomList($listWrapper);
    }

    /**
     * 사용자 지정 게임 방의 게임 방 리스트를 렌더링합니다.
     * @param $listWrapper {HTMLElement} 게임 방 리스트를 렌더링할 <div> 엘리먼트
     */
    this.renderGameRoomList = ($listWrapper) => {
        for (let data of this.state) {
            const {room} = data;
            $listWrapper.insertAdjacentHTML("afterbegin", `
                <div class="game-room-list room-wrapper">
                    ${this.renderRoom(room)}
                </div>
            `);
        }
    }

    /**
     * 비밀방 여부에 따른 HTML 문자열을 반환합니다.
     * @param room {object} 게임 방의 정보
     * @returns {string} 비밀방 여부에 따른 HTML 문자열
     */
    this.getSecretRoomHTML = (room) => {
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
    this.getRoomStyle = (room) => {
        let borderColor = room.roomStatus === "대기중" ? "#08F6B0" : "#FF79C5";
        let textColor = borderColor; // 텍스트 색상을 테두리 색상과 동일하게 설정
        return { borderColor, textColor };
    };

    /**
     * 게임 방의 정보를 렌더링합니다.
     * @param room {object} 게임 방의 정보
     * @returns {string} 게임 방의 정보를 렌더링한 HTML 문자열
     */
    this.renderRoom = (room) => {
        let isSecretHTML = this.getSecretRoomHTML(room);
        let { borderColor, textColor } = this.getRoomStyle(room);

        return `
            <div class="game-room-list room-info" id="room-content" style="color: rgb(255, 255, 255); font-family: Galmuri11, serif; border: 1px solid ${borderColor}; border-radius: 10px; width: 100%;">
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

    this.useState();
    this.render();
}