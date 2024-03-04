import { BACKEND, HISTORIES_IMAGE_PATH, MODE } from "../../global.js";
import { getCookie } from "../../utils/cookie.js";
import useState from "../../utils/useState.js";
import { getUserMe } from "../../utils/userUtils.js";
import { navigate } from "../../utils/navigate.js";
import { Histories } from "./page.js";

export default function Summary() {
  new Histories(document.getElementById("app"));
  this.$container = document.getElementById("content");
  this.$pagination = document.getElementById("pagination");

  const init = () => {
    this.$container.textContent = "";
    this.$pagination.style.display = "none";
    getUserMe().then((response) => {
      let { nickname } = response.data;
      fetch(`${BACKEND}/users/${nickname}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("jwt")}`,
        },
      }).then((response) => {
        if (response.ok) {
          response.json().then((data) => {
            setUsersHistoriesSummary(data);
          });
        } else {
          navigate("error", { errorCode: response.status });
        }
      });
    });
  };

  /**
   * 사용자의 전적 개요를 렌더링합니다.
   */
  this.render = () => {
    const {
      nickname,
      avatar,
      rating,
      custom_1v1_win_rate,
      custom_tournament_win_rate,
      rank_win_rate,
    } = getUsersHistoriesSummary();
    this.$container.insertAdjacentHTML(
      "afterbegin",
      `
    <div class="histories summary" id="summary-wrapper">
        <div class="histories summary" id="user-info">
            ${renderUserInfo({ nickname, avatar })}
        </div>
        <div class="histories summary" id="data">
            ${renderHistoriesSummary({ rating, custom_1v1_win_rate, custom_tournament_win_rate, rank_win_rate })}
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
   * @param {{
   * rating: number,
   * custom_1v1_win_rate: number,
   * custom_tournament_win_rate: number,
   * rank_win_rate: number
   * }} props 사용자의 전적 개요 데이터
   */
  const renderHistoriesSummary = (props) => {
    return `
      <div class="histories summary" id="rating">
        <span>Rating: </span>
        <span>${props.rating}</span>
      </div>
      <div class="histories summary" id="casual-win-rate">
        <span>${MODE.casual} 승률: </span>
        <span>${props.custom_1v1_win_rate}%</span>
      </div>
      <div class="histories summary" id="tournament-win-rate">
        <span>${MODE.tournament} 승률: </span>
        <span>${props.rank_win_rate}%</span>
      </div>
    `;
  };

  init();
  const [getUsersHistoriesSummary, setUsersHistoriesSummary] = useState(
    {},
    this,
    "render",
  );
}
