/**
 *
 * @param {HTMLElement} $container
 * @param {number} errorCode
 */
export default function ErrorPage($container, errorCode) {
  this.$container = $container;
  this.comment = '';

  this.setState = () => {
    switch (errorCode) {
      case 401:
        this.comment = '어이 넌 권한이 없다.';
        break;
      case 403:
        this.comment = '클라이언트 요청 관련 오류.';
        break;
      case 410:
        this.comment = '사라진 리소스.';
        break;
      case 500:
        this.comment = '알 수 없는 서버 내부 오류.';
        break;
      case 503:
        this.comment = '일시적인 서버 오류.';
        break;
      default:
        this.comment = '알 수 없는 오류.';
        break;
    }
    this.render();
  };

  this.render = () => {
    this.$container.innerHTML = `
    <div style="width: 100vw; height: 100vh; position: relative; background: #0000AA; display: flex; align-items: center; flex-direction: column">
  <span style="color: rgba(0, 0, 0, 0.20); font-size: 130px; font-family: Galmuri11; font-weight: 700; word-wrap: break-word; margin-top: 14vh">${errorCode} !<br/></span>
  <span style="color: white; font-size: 70px; font-family: Galmuri11; font-weight: 700; word-wrap: break-word"><br/>${this.comment}</span>
</div>
    `;
  };

  this.setState();
}
