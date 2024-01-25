export default async function Summary() {
  this.$container = document.getElementById("list");
  this.$pagination = document.getElementById("pagination");
  this.needToRender = false;

  this.init = () => {
    this.$pagination.style.display = "none";
  }

  this.useState = async () => {
    this.newState = await this.getUsersHistoriesSummary();
  }

  this.setState = async () => {
    if (this.state === this.newState) {
      this.needToRender = false;
      return;
    }
    this.state = this.newState;
    this.needToRender = true;
  }

  /**
   * 사용자의 전적 개요를 렌더링합니다.
   */
  this.render = () => {
    if (!this.needToRender) return;
    const { nickname, avatar, rating, win_rate, custom_win_rate, tournament_win_rate } = this.state;
    this.$container.innerHTML = `
    <div class="histories summary" id="summary-wrapper">
        <div class="histories summary" id="user-info">
            ${this.renderUserInfo({ nickname, avatar })}
        </div>
        <div class="histories summary" id="histories-info">
            ${this.renderHistoriesSummary({ rating, win_rate, custom_win_rate, tournament_win_rate })}
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
   * @param {{nickname: string, avatar: string}} props 사용자의 닉네임과 아바타 이미지 주소
   */
  this.renderUserInfo = (props) => {
    return (``);
  }

  /**
   * 사용자의 전적 개요 데이터를 렌더링합니다.
   * @param {{custom_win_rate: number, tournament_win_rate: number, rating: number, win_rate: number}} props 사용자의 전적 개요 데이터
   */
  this.renderHistoriesSummary = (props) => {
    return (``);
  }

  this.init();
  await this.useState();
  await this.setState();
  this.render();
}
