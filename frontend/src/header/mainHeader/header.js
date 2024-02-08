import { hoverChangeCursor } from "../../utils/hoverEvent.js";
import { importCss } from "../../utils/importCss.js";
import { getCookie } from "../../utils/cookie.js";
import { navigate } from "../../utils/navigate.js";
import { click } from "../../utils/clickEvent.js";

/**
 * 사용자 전적 페이지에 사용하는 header 컴포넌트
 * @param {HTMLElement} $container
 */
export default function historiesHeader($container) {
  this.$container = $container;
  this.imagePath = "../../../assets/images";

  this.setState = () => {
    const token = getCookie("jwt");
    fetch("https://localhost/api/users/me").then((response) => {
      if (response.status === 200) {
        response.json().then((data) => {
          console.log(data);
          this.render(data.nickname, data.avatar_file_name);
        });
      } else {
        navigate("/500");
      }
    });
  };

  importCss("../../../assets/fonts/font.css");
  this.render = (nickname, avatar_file_name) => {
    this.$container.innerHTML = `
        <div class="main header-wrapper">
            <div class="main" id="left-side">
                <img src="../../../assets/images/go_back.png" alt="뒤로가기" class="main" id="go-back">
            </div>
            <div class="main" id="title">사십 이 초-월</div>
            <div class="main" id="right-side">
                <div class="main" id="user-info">
                    <span class="main" id="nickname">${nickname}</span>
                    <img src="${this.imagePath}/avatar/${avatar_file_name}" alt="아바타" id="user-avatar">
                </div>
                <img src="${this.imagePath}/friends.png" alt="친구 목록" id="friends">
            </div>
        </div>
        `;

    // 뒤로가기 버튼 클릭 이벤트
    click("go-back", () => {
      history.back();
    });
  };

  this.setState();
  this.render();
}
