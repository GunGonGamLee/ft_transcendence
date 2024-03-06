import { Histories } from "../histories/page.js";
import {
  AVATAR_FILE_NAME,
  BACKEND,
  HISTORIES_IMAGE_PATH,
} from "../../global.js";
import { importCss } from "../../utils/importCss.js";
import { getUserMe } from "../../utils/userUtils.js";
import { getCookie } from "../../utils/cookie.js";
import { navigate } from "../../utils/navigate.js";

export default function Avatar($container) {
  new Histories($container);
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

  const uploadAvatar = (files) => {
    const $avatarName = document.getElementById("avatar-name");
    $avatarName.value = files[0].name;
    let formData = new FormData();
    formData.append("avatar", files[0]);
    getUserMe().then((response) => {
      const { nickname } = response.data;
      const $uploadMessage = document.getElementById("upload-message");
      $uploadMessage.textContent = "업로드 중...";
      $uploadMessage.className = "avatar uploading";
      fetch(`${BACKEND}/users/${nickname}/avatar/`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${getCookie("jwt")}`,
        },
      }).then((response) => {
        if (response.ok) {
          const $userAvatar = document.getElementById("user-avatar");
          $userAvatar.src = `${HISTORIES_IMAGE_PATH}/avatar/${files[0].name}`;
          $uploadMessage.className = "avatar success";
          $uploadMessage.textContent = "업로드에 성공했다.";
        } else {
          $uploadMessage.className = "avatar error";
          $uploadMessage.textContent = "업로드에 실패했다.";
        }
      });
    });
  };

  const updateAvatar = (avatarName) => {
    getUserMe().then((response) => {
      const { nickname } = response.data;
      fetch(`${BACKEND}/users/${nickname}/avatar/?avatar=${avatarName}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${getCookie("jwt")}`,
          "Content-type": "application/json",
        },
      }).then((response) => {
        if (response.ok) {
          const $userAvatar = document.getElementById("user-avatar");
          $userAvatar.src = `${HISTORIES_IMAGE_PATH}/avatar/${avatarName}`;
        } else {
          navigate("error", { errorCode: response.status });
        }
      });
    });
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
          <label for="avatar-upload" class="avatar upload">
            <span>파일찾기</span>
          </label>
          <input type="text" id="avatar-name" placeholder="파일을 선택해라." readonly>
          <input type="file" id="avatar-upload" accept="image/*"">
        </div>
        <div class="avatar" id="upload-message">
          <span></span>
        </div>
      </div>
    `,
    );

    const $avatarUpload = document.getElementById("avatar-upload");
    $avatarUpload.addEventListener("change", (e) =>
      uploadAvatar(e.target.files),
    );

    const $avatarExamples = document.getElementsByClassName("avatar examples");
    for (let $avatar of $avatarExamples) {
      $avatar.addEventListener("click", (e) => {
        const avatarName = e.target.getAttribute("src").split("/").pop();
        updateAvatar(avatarName);
      });
    }
  };

  init();
  render();
}
