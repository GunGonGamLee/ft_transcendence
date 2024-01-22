import {click} from "../../utils/clickEvent.js";
import {hoverChangeCursor} from "../../utils/hoverEvent.js";

/**
 * 사용자 전적 페이지에 사용하는 header 컴포넌트
 * @param {HTMLElement} $container
 */
export default function historiesHeader($container) {
  this.$container = $container;

  this.setState = () => {
    this.render();
  }

  this.render = () => {
    this.$container.innerHTML = `
        <div class="main header-wrapper">
            <div class="main" id="left-side">
                <img src="../../../assets/images/search.png" alt="">
                <div class="main" id="search-box">
                    <input type="text">
                </div>
            </div>
            <div class="main" id="title">너의 기록은</div>
            <div class="main" id="right-side">
                <div class="main" id="user-avatar">
                    <img src="../../../assets/images/avatar/red.png" alt="">
                </div>
                <div class="main" id="close-button"></div>
            </div>
        </div>
        `
  }

  /**
   * 헤더의 레이아웃에 이벤트 리스너를 추가합니다.
   */
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
