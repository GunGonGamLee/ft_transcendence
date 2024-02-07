import { hoverChangeCursor } from "../../utils/hoverEvent.js";
import { importCss } from "../../utils/importCss.js";

/**
 * 사용자 전적 페이지에 사용하는 header 컴포넌트
 * @param {HTMLElement} $container
 */
export default function historiesHeader($container) {
  this.$container = $container;
  this.imagePath = "../../../assets/images";

  this.setState = () => {
    const token = localStorage.getItem("jwtToken");
    console.log("hi");
    fetch("https://localhost/api/users/me", {
      method: "GET",
      headers: {
        "Content-type": "application/json",
        ...(token ? { Authorization: "Bearer " + token } : {}),
      }
    });
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
                <img src="${this.imagePath}/avatar/red_bust.png" alt="아바타" id="user-avatar">
                <img src="${this.imagePath}/friends.png" alt="친구 목록" id="friends">
            </div>
        </div>
        `;

    hoverChangeCursor(document.getElementById("go-back"), "pointer");
    hoverChangeCursor(document.getElementById("user-avatar"), "pointer");
    hoverChangeCursor(document.getElementById("friends"), "pointer");
  };

  this.setState();
  this.render();
}
