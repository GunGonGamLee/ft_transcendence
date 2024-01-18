import {click} from "../utils/clickEvent.js";
import {hoverChangeCursor} from "../utils/hoverEvent.js";

/**
 * 사용자 전적 페이지에 사용하는 header 컴포넌트
 * @param {HTMLElement} $container
 */
export default function HistoriesHeader($container) {
  this.$container = $container;

  this.setState = () => {
    this.render();
  }

  this.render = () => {
    this.$container.innerHTML = `
        <div class="histories header-wrapper">
            <div class="histories" id="left-side">
                <img src="../../assets/images/search.png" alt="">
                <div class="histories" id="search-box">
                    <input type="text">
                </div>
            </div>
            <div class="histories" id="title">너의 기록은</div>
            <div class="histories" id="right-side">
                <div class="histories" id="user-avatar">
                    <img src="../../assets/images/avatar/red.png" alt="">
                </div>
                <div class="histories" id="close-button"></div>
            </div>
        </div>
        `
  }

  this.addEventListenersToLayout = () => {
    const $closeButton = document.getElementById("close-button");
    click($closeButton, function () {
      console.log("전적 창 닫기");
    });
    hoverChangeCursor($closeButton, "pointer");
  }

  this.render();
  this.addEventListenersToLayout();
}
