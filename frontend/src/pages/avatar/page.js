import { Histories } from "../histories/page.js";
import { AVATAR_FILE_NAME, HISTORIES_IMAGE_PATH } from "../../global.js";
import { importCss } from "../../utils/importCss.js";

export default function Avatar() {
  new Histories(document.getElementById("app"));
  this.$content = document.getElementById("content");
  this.$pagination = document.getElementById("pagination");

  const init = () => {
    this.$pagination.style.display = "none";
    importCss("../../../assets/css/avatar.css");
  };

  const renderAvatarExamples = () => {
    let html = "";
    for (let avatar of AVATAR_FILE_NAME) {
      html += `
        <img class="avatar examples" src="${HISTORIES_IMAGE_PATH}/avatar/${avatar}" alt="${avatar}">
      `;
    }
    return html;
  };

  const render = () => {
    this.$content.insertAdjacentHTML(
      "beforeend",
      `
      <div class="avatar-wrapper basic">
        <div class="avatar update-type">
            기본
        </div>
        <div class="avatar examples-wrapper">
            ${renderAvatarExamples()}
        </div>
      </div>
      <div class="avatar-wrapper upload">
        <div class="avatar update-type">
            사진 올리기
        </div>
        <div class="avatar upload-wrapper">
            <input type="file" id="avatar-upload" accept="image/*">
        </div>
      </div>
    `,
    );
  };

  init();
  render();
}
