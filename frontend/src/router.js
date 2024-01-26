import { routes } from "./constants/routeInfo.js";
import ErrorPage from "./pages/errorPage.js";
import MainHeader from "./header/mainHeader/header.js";
import { $ }from "./utils/querySelector.js";
/**
 * @param {HTMLElement} $container
 */
export default function Router($container) {
  this.$container = $container;
  this.$header = $('#header');
  this.currentPage = undefined;
  this.currentHeader = undefined;

  const findMatchedRoute = () =>
    routes.find((route) => route.path.test(location.pathname));

  const route = () => {
    const TargetPage = findMatchedRoute()?.page || ErrorPage; // 현재 경로에 따라 렌더링할 컴포넌트를 정의합니다.
    const TargetHeader = findMatchedRoute()?.header || MainHeader; // 헤더 컴포넌트도 정의합니다.
    if (location.pathname === '/500') { // 500 에러 페이지를 렌더링합니다.
        alert('500');
        this.currentPage = new ErrorPage(this.$container, 500);
        this.currentHeader = new MainHeader(this.$header);
    }
    else if (TargetPage === ErrorPage) {
      this.currentPage = new ErrorPage(this.$container, 401); // 그냥 아래 부분과 합쳐도 되지만 가독성을 위해 분리했습니다.
      this.currentHeader = new MainHeader(this.$header);
    }
    else {
      if (this.currentPage instanceof TargetPage) return; // 현재 페이지와 이동할 페이지가 같으면 렌더링하지 않습니다.
      this.currentPage = new TargetPage(this.$container);
      if (this.currentHeader instanceof TargetHeader) return; // 현재 헤더와 이동할 헤더가 같으면 렌더링하지 않습니다.
      this.currentHeader = new TargetHeader(this.$header);
    }
  };

  const init = () => { // 페이지 이동 시 발생하는 이벤트를 정의합니다.
    window.addEventListener("historychange", ({ detail }) => {
      const { to, isReplace } = detail;

      if (isReplace || to === location.pathname)
        // 같은 페이지로 이동할 때는 history를 쌓지 않습니다.
        history.replaceState(null, "", to);
      else history.pushState(null, "", to);

      route();
    });
    // 뒤로가기 눌렀을 때 발생하는 이벤트를 정의합니다.
    window.addEventListener("popstate", () => {
      route();
    });
  };

  init();
  route();
}
