/**
 * @param {HTMLElement} $container
 */
export default function Nickname($container) {
  this.$container = $container;
  this.setState = () => {
    this.render();
  };

  this.render = () => {
    this.$container.innerHTML = `
    <div style="width: 100vw; height: 88vh; background: #191D40; display: flex; flex-direction: column; align-items: center">
      <div style="text-align: center; color: #FBFF3E; font-size: 64px; font-family: Galmuri11, serif; font-weight: 700;">사십 이 초-월</div>
      <div class="white-box" style="display: flex; flex-direction: column; align-items: center; margin-top: 10vh; width: 45vw; height: 50vh; background-color: #191D40; border: 2px solid white">
        <div style="margin-top: 10vh; text-align: center; color: white; font-size: 60px; font-family: Galmuri11, serif;">별명을 적어라</div>
          <form id="nicknameForm">
            <input style="margin-top: 5vh; text-align: center; font-family: Galmuri11, serif; font-size: 45px; height: 10vh; width: 30vw" placeholder="최대 8글자 가능하다" maxlength="8">
          </form>
        <div style="margin-top: 3vh; text-align: center; color: red; font-size: 20px; font-family: Galmuri11-Bold, serif;"></div>
      </div>
    </div>
	  `;
  };

  this.setState();
  this.$container.querySelector('#nicknameForm').addEventListener('submit', (e) => {
    e.preventDefault();
    this.$container.querySelector('#nicknameForm input').value = '';
    // ajax 로직
    // 유효한 닉네임
    // alert('제출');
    // 유효하지 않은 닉네임
    this.$container.querySelector('.white-box').style.borderColor = 'red';
    this.$container.querySelector('.white-box div:last-child').innerHTML = '이미 존재하는 닉네임이다';
  });
}
