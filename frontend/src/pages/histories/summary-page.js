import { MODE } from "../../global.js";

export default async function Summary() {
  this.$container = document.getElementById("content");
  this.$pagination = document.getElementById("pagination");
  this.needToRender = false;

  this.init = () => {
    this.$container.textContent = "";
    this.$pagination.style.display = "none";
  };

  this.useState = async () => {
    this.newState = await this.getUsersHistoriesSummary();
  };

  this.setState = () => {
    if (this.state === this.newState) {
      this.needToRender = false;
      return;
    }
    this.state = this.newState;
    this.needToRender = true;
  };

  /**
   * 사용자의 전적 개요를 렌더링합니다.
   */
  this.render = () => {
    if (!this.needToRender) return;
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
            ${this.renderUserInfo({ nickname, avatar })}
        </div>
        <div class="histories summary" id="data">
            ${this.renderHistoriesSummary({ rating, win_rate, casual_win_rate, tournament_win_rate })}
        </div>
    </div>
    `,
    );
  };

  /**
   * 사용자의 전적 개요 데이터를 가져옵니다.
   * @returns {Promise<{
   *    nickname: string,
   *    avatar: string,
   *    rating: number,
   *    win_rate: number,
   *    casual_win_rate: number,
   *    tournament_win_rate: number
   * }>}
   */
  this.getUsersHistoriesSummary = async function () {
    // TODO => API 요청으로 await 해서 데이터 받아오기
    return {
      nickname: "yena",
      avatar: "../../../assets/images/avatar/green.png",
      rating: 2103,
      win_rate: 43,
      casual_win_rate: 52,
      tournament_win_rate: 45,
    };
  };

  /**
   * 사용자의 정보를 렌더링합니다.
   * @param {{nickname: string, avatar: string}} props 사용자의 닉네임과 아바타 이미지 주소
   */
  this.renderUserInfo = (props) => {
    return `
        <img class="histories summary" src="${props.avatar}" alt="avatar">
        <span>${props.nickname}</span>
    `;
  };

  /**
   * 사용자의 전적 개요 데이터를 렌더링합니다.
   * @param {{rating: number, casual_win_rate: number, tournament_win_rate: number}} props 사용자의 전적 개요 데이터
   */
  this.renderHistoriesSummary = (props) => {
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

  this.init();
  await this.useState();
  this.setState();
  this.render();
}
