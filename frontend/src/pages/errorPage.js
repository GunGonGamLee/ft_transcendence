import { importCss } from "../utils/importCss.js";
/**
 * @param {HTMLElement} $container
 * @param {number} errorCode
 */
export default function ErrorPage($container, errorCode = 0) {
  this.$container = $container;
  this.comment = "";

  this.init = () => {
    switch (errorCode) {
      case 401:
        this.comment = "어이 넌 권한이 없다.";
        break;
      case 403:
        this.comment = "클라이언트 요청 관련 오류.";
        break;
      case 410:
        this.comment = "사라진 리소스.";
        break;
      case 500:
        this.comment = "알 수 없는 서버 내부 오류.";
        break;
      case 503:
        this.comment = "일시적인 서버 오류.";
        break;
      default:
        this.comment = "알 수 없는 오류.";
        break;
    }
    this.render();
  };

  this.render = () => {
    importCss("../../assets/css/errorPage.css");
    this.$container.innerHTML = `
    <div class="errorPage-container">
      <span class="error-code">${errorCode} !<br/></span>
      <span class="error-comment">${this.comment}</span>
    </div>
    `;
  };

  this.init();
}
