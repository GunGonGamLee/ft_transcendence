import { routes } from "./constants/routeInfo.js";
import ErrorPage from "./pages/errorPage.js";
import MainHeader from "./header/mainHeader/header.js";
/**
 * @param {HTMLElement} $container
 */
export default function Router($container) {
  let $header = document.querySelector("#header");
  let currentPage = undefined;
  let currentHeader = undefined;

  const findMatchedRoute = () =>
    routes.find((route) => route.path.test(location.pathname));

  const route = (errorCode = 0) => {
    const TargetPage = findMatchedRoute()?.page || ErrorPage; // 현재 경로에 따라 렌더링할 컴포넌트를 정의합니다.
    const TargetHeader = findMatchedRoute()?.header || MainHeader; // 헤더 컴포넌트도 정의합니다.
    if (errorCode) { // 에러 페이지로 이동할 때는 errorCode를 전달합니다.
      currentPage = new ErrorPage($container, errorCode);
      currentHeader = new MainHeader($header);
    } else if (TargetPage === ErrorPage) {
      currentPage = new ErrorPage($container, 401); // 그냥 아래 부분과 합쳐도 되지만 가독성을 위해 분리했습니다.
      currentHeader = new MainHeader($header);
    } else {
      currentPage = new TargetPage($container);
      currentHeader = new TargetHeader($header);
    }
  };

  const init = () => {
    // 페이지 이동 시 발생하는 이벤트를 정의합니다.
    window.addEventListener("historychange", ({ detail }) => {
      const { to, errorCode } = detail;
      // 같은 페이지로 이동할 때는 history를 쌓지 않습니다.
      if (to === location.pathname)
        history.replaceState(null, "", to);
      else {
        history.pushState(null, "", to);
        if (errorCode)
          route(errorCode);
        else
          route(); // 여기서 route함수를 참조하므로 이 객체의 생명주기는 window 객체와 같습니다.
      }
    });
    // 뒤로가기 눌렀을 때 발생하는 이벤트를 정의합니다.
    window.addEventListener("popstate", () => {
      route();
    });
  };

  init();
  route();
}
