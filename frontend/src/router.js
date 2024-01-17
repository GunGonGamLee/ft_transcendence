import { routes } from "./constants/routeInfo.js";
import ErrorPage from "./pages/errorPage.js";
import ErrorHeader from "./header/errorHeader/header.js";
import { $ }from "./utils/querySelector.js";
/**
 * @param {HTMLElement} $container
 */
export default function Router($container) {
  this.$container = $container;
  let $header = $('#header');
  let currentPage = undefined;
  let currentHeader = undefined;

  const findMatchedRoute = () =>
    routes.find((route) => route.path.test(location.pathname));

  const route = () => {
    currentPage = null;
    const TargetPage = findMatchedRoute()?.page || ErrorPage; // 현재 경로에 따라 렌더링할 컴포넌트를 정의합니다.
    const TargetHeader = findMatchedRoute()?.header || ErrorHeader; // 헤더 컴포넌트도 정의합니다.
    if (TargetPage === ErrorPage) {
      currentPage = new ErrorPage(this.$container, 401);
      currentHeader = new ErrorHeader($header);
    }
    else {
      currentPage = new TargetPage(this.$container);
      currentHeader = new TargetHeader($header);
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
