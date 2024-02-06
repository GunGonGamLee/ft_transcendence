import { hoverChangeCursor } from "../../utils/hoverEvent.js";
import { importCss } from "../../utils/importCss.js";

/**
 * 사용자 전적 페이지에 사용하는 header 컴포넌트
 * @param {HTMLElement} $container
 */
export default function historiesHeader($container) {
  this.$container = $container;

  this.setState = () => {
    this.render();
    document.getElementById("go-back").addEventListener("click", () => {
      history.back();
    });
  };

  importCss("../../../assets/fonts/font.css");
  this.render = () => {
    this.$container.innerHTML = `
        <div class="main header-wrapper">
            <div class="main" id="left-side">
                <img src="../../../assets/images/go_back.png" alt="뒤로가기" class="main" id="go-back">
            </div>
            <div class="main" id="title">사십 이 초-월</div>
            <div class="main" id="right-side">
                <img src="../../../assets/images/avatar/red_bust.png" alt="아바타" id="user-avatar">
                <img src="../../../assets/images/friends.png" alt="친구 목록" id="friends">
            </div>
        </div>
        `;

    hoverChangeCursor(document.getElementById("go-back"), "pointer");
    hoverChangeCursor(document.getElementById("user-avatar"), "pointer");
    hoverChangeCursor(document.getElementById("friends"), "pointer");
  };

  this.setState();
}
