import { HISTORIES_IMAGE_PATH, MODE } from "../../global.js";
import { useState } from "../../state.js";

export default function Summary() {
  this.$container = document.getElementById("content");
  this.$pagination = document.getElementById("pagination");
  let [getUsersHistoriesSummary, setUsersHistoriesSummary] = useState(
    {
      nickname: "yena",
      avatar: "chewbacca.png",
      rating: 2103,
      win_rate: 43,
      casual_win_rate: 52,
      tournament_win_rate: 45,
    },
    "render",
  );

  const init = () => {
    this.$container.textContent = "";
    this.$pagination.style.display = "none";
  };

  /**
   * 사용자의 전적 개요를 렌더링합니다.
   */
  const render = () => {
    const {
      nickname,
      avatar,
      rating,
      win_rate,
      casual_win_rate,
      tournament_win_rate,
    } = this.state;
    this.$container.insertAdjacentHTML(
      "afterbegin",
      `
    <div class="histories summary" id="summary-wrapper">
        <div class="histories summary" id="user-info">
            ${renderUserInfo({ nickname, avatar })}
        </div>
        <div class="histories summary" id="data">
            ${renderHistoriesSummary({ rating, win_rate, casual_win_rate, tournament_win_rate })}
        </div>
    </div>
    `,
    );
  };

  /**
   * 사용자의 정보를 렌더링합니다.
   * @param {{nickname: string, avatar: string}} props 사용자의 닉네임과 아바타 이미지 주소
   */
  const renderUserInfo = (props) => {
    return `
        <img class="histories summary" src="${HISTORIES_IMAGE_PATH}/avatar/${props.avatar}" alt="avatar">
        <span>${props.nickname}</span>
    `;
  };

  /**
   * 사용자의 전적 개요 데이터를 렌더링합니다.
   * @param {{rating: number, casual_win_rate: number, tournament_win_rate: number}} props 사용자의 전적 개요 데이터
   */
  const renderHistoriesSummary = (props) => {
    return `
      <div class="histories summary" id="rating">
        <span>Rating: </span>
        <span>${props.rating}</span>
      </div>
      <div class="histories summary" id="casual-win-rate">
        <span>${MODE.casual} 승률: </span>
        <span>${props.casual_win_rate}%</span>
      </div>
      <div class="histories summary" id="tournament-win-rate">
        <span>${MODE.tournament} 승률: </span>
        <span>${props.tournament_win_rate}%</span>
      </div>
    `;
  };

  init();
  useState();
  setState();
  render();
}
