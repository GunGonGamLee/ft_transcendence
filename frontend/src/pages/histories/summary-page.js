import { BACKEND, HISTORIES_IMAGE_PATH, MODE } from "../../global.js";
import { getCookie } from "../../utils/cookie.js";
import useState from "../../utils/useState.js";
import { getUserMe } from "../../utils/userUtils.js";
import { navigate } from "../../utils/navigate.js";
import { Histories } from "./page.js";
import { formatWinRate } from "../../utils/formatUtils.js";

export default function Summary($app, info) {
  new Histories($app);
  this.$container = document.getElementById("content");
  this.$pagination = document.getElementById("pagination");

  const init = () => {
    this.$container.textContent = "";
    this.$pagination.style.display = "none";

    if (info === null || info === undefined || info.nickname === "") {
      getUserMe().then((response) => {
        let { nickname } = response.data;
        getHistoriesSummary(nickname);
      });
    } else {
      getHistoriesSummary(info.nickname);
    }
  };

  /**
   * 사용자의 전적 개요를 가져온다.
   * @param nickname { string } 사용자의 닉네임
   */
  const getHistoriesSummary = (nickname) => {
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
      } else if (response.status === 404) {
        renderUserNotFound(nickname);
      } else {
        navigate("error", { errorCode: response.status });
      }
    });
  };

  const renderUserNotFound = (nickname) => {
    this.$container.insertAdjacentHTML(
      "beforeend",
      `
      <div class="histories summary user-not-found">
        <span>${nickname}은(는) 존재하지 않는다.</span>
      </div>`,
    );
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
        <span>${formatWinRate(props.custom_1v1_win_rate)}</span>
      </div>
      <div class="histories summary" id="custom-win-rate">
        <span>${MODE.casual_tournament} 승률: </span>
        <span>${formatWinRate(props.custom_tournament_win_rate)}</span>
      </div>
      <div class="histories summary" id="tournament-win-rate">
        <span>${MODE.rank} 승률: </span>
        <span>${formatWinRate(props.rank_win_rate)}</span>
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
