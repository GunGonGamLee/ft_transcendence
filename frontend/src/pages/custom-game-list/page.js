import {click} from "../../utils/clickEvent.js"
import GameRoomList from "./game-room-list.js";
import {importCss} from '../../utils/importCss.js';


export default function CustomGameList($container) {
    this.$container = $container;

    this.setState = () => {
        this.render();
    }

    this.render = () => {
        this.renderLayout();
        this.renderList();
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
                    <a class="custom-game-list" id="pagination-arrow-right" style="color: rgb(255, 255, 255); font-family: Galmuri11, serif;">
                        >
                    </a>
                </div>
            </div>
            <footer class="custom-game-list" id="game-room-options-wrapper>
                <div class="">
                    <a class="custom-game-list" id="quick-join" style="color: rgb(255, 255, 255); font-family: Galmuri11, serif;">신속히 입장</a>
                    <a class="custom-game-list" id="create-room" style="color: rgb(255, 255, 255); font-family: Galmuri11, serif;">방 만들기</a>
                    <a class="custom-game-list" id="room-filter" style="color: rgb(255, 255, 255); font-family: Galmuri11, serif;">방 걸러보기</a>
                </div>
            </footer>
        `)
    }

    this.renderList = () => {
        let $list = document.getElementById("game-room-list-wrapper");
        GameRoomList.bind($list)();
    }

    this.render();
}