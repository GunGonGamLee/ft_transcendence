export default async function Summary() {
  this.$container = document.getElementById("list");
  this.$pagination = document.getElementById("pagination");

  this.init = () => {
    this.$pagination.style.display = "none";
  }

  this.setState = () => {
    this.render();
  }

  /**
   * 사용자의 전적 개요를 렌더링합니다.
   * @param data {{
   *    nickname: string,
   *    avatar: string,
   *    rating: number,
   *    win_rate: number,
   *    custom_win_rate: number,
   *    tournament_win_rate: number
   * }} 사용자의 전적 개요 데이터. nickname, avatar, rating, win_rate, custom_win_rate, tournament_win_rate를 포함합니다.
   */
  this.render = (data) => {
    const { nickname, avatar, rating, win_rate, custom_win_rate, tournament_win_rate } = data;
    this.$container.innerText = `
    <div class="histories summary" id="summary-wrapper">
        <div class="histories summary" id="user-info">
            ${renderUserInfo(nickname, avatar)}
        </div>
        <div class="histories summary" id="histories-info">
            ${renderHistoriesSummary(rating, win_rate, custom_win_rate, tournament_win_rate)}
        </div>
    </div>
    `;
  }

  /**
   * 사용자의 전적 개요 데이터를 가져옵니다.
   * @returns {Promise<{
   *    nickname: string,
   *    avatar: string,
   *    rating: number,
   *    win_rate: number,
   *    custom_win_rate: number,
   *    tournament_win_rate: number
   * }>}
   */
  this.getUsersHistoriesSummary = async function () {
    // TODO => API 요청으로 await 해서 데이터 받아오기
    // const nickname = localStorage.getItem("nickname");
    // const data = await fetch(`/api/users/${nickname}/info`, {
    //   method: "GET",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // }).then((res) => res.json());
    return {
      nickname: 'yena',
      avatar: '../../../assets/images/avatar/green.png',
      rating: 2103,
      win_rate: 43,
      custom_win_rate: 52,
      tournament_win_rate: 45,
    };
  }

  /**
   * 사용자의 정보를 렌더링합니다.
   * @param nickname {string} 사용자의 닉네임
   * @param avatar {string} 사용자의 아바타 이미지 URL
   */
  this.renderUserInfo = (nickname, avatar) => {

  }

  /**
   * 사용자의 전적 개요 데이터를 렌더링합니다.
   * @param rating {number} 사용자의 레이팅 점수
   * @param win_rate {number} 사용자의 전체 승률 (토너먼트 + 커스텀)
   * @param custom_win_rate {number} 사용자의 커스텀 게임 승률 (1 vs 1 모드 + 토너먼트 모드)
   * @param tournament_win_rate {number} 사용자의 토너먼트 게임 승률
   */
  this.renderHistoriesSummary = (rating, win_rate, custom_win_rate, tournament_win_rate) => {

  }

  this.init();
  const data = await this.getUsersHistoriesSummary();
  this.render(data);
}
