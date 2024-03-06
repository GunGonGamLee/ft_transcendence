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

  /**
   * 기본으로 제공되는 5개의 아바타 파일명을 이용하여 아바타 이미지를 렌더링하는 함수. 아바타 이미지를 클릭하면 해당 아바타로 변경된다.
   * @returns { string } 아바타 이미지를 렌더링한 HTML 문자열
   */
  const renderAvatarExamples = () => {
    let html = "";
    for (let avatar of AVATAR_FILE_NAME) {
      html += `
        <img class="avatar examples" src="${HISTORIES_IMAGE_PATH}/avatar/${avatar}" alt="${avatar}">
      `;
    }
    return html;
  };

  /**
   * 아바타 파일을 업로드하는 함수
   * @param files { DataTransfer.files } 업로드할 파일
   */
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

  /**
   * 사용자의 아바타를 업데이트하는 함수
   * @param avatarName { string } 업데이트할 아바타 파일명으로, 확장자를 포함한다. 기본으로 제공되는 5개의 아바타 파일명 중 하나.
   */
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

  /**
   * 아바타 변경 페이지를 렌더링하는 함수. 아바타 변경 페이지는 기본 아바타와 업로드 아바타로 구성되어 있다.
   */
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
