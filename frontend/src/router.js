import { routes } from "./constants/routeInfo.js";
import ErrorPage from "./pages/errorPage.js";
import MainHeader from "./header/mainHeader/header.js";
import emptyHeader from "./header/emptyHeader/header.js";
/**
 * @param {HTMLElement} $container
 */
export default function Router($container) {
  let $header = document.querySelector("#header");
  let currentPage = undefined;
  let currentHeader = undefined;
  let prevInfo = undefined;

  const findMatchedRoute = () =>
    routes.find((route) => route.path.test(location.pathname));

  const route = (info) => {
    // 현재 페이지에서 Unmount 함수가 있다면 호출합니다.
    if (currentPage !== undefined && currentPage.unmount) currentPage.unmount();
    const TargetPage = findMatchedRoute()?.page || ErrorPage; // 현재 경로에 따라 렌더링할 컴포넌트를 정의합니다.
    const TargetHeader = findMatchedRoute()?.header || MainHeader; // 헤더 컴포넌트도 정의합니다.
    if (info != null && info.errorCode) {
      // 에러 페이지로 이동할 때는 errorCode를 전달합니다.
      currentPage = new ErrorPage($container, info.errorCode);
      currentHeader = new emptyHeader($header);
    } else if (TargetPage === ErrorPage) {
      currentPage = new ErrorPage($container, 404); // 그냥 아래 부분과 합쳐도 되지만 가독성을 위해 분리했습니다.
      currentHeader = new emptyHeader($header);
    } else {
      if (currentPage instanceof TargetPage && prevInfo === info) return; // 이전 페이지와 같은 페이지로 이동할 때는 렌더링하지 않습니다.
      prevInfo = info;
      currentPage = new TargetPage($container, info);
      if (currentHeader instanceof TargetHeader) return; // 이전 페이지와 같은 페이지로 이동할 때는 렌더링하지 않습니다.
      currentHeader = new TargetHeader($header);
    }
  };

  const init = () => {
    // 페이지 이동 시 발생하는 이벤트를 정의합니다.
    window.addEventListener("historychange", ({ detail }) => {
      const { to, info } = detail;
      // 같은 페이지로 이동할 때는 history를 쌓지 않습니다.
      if (to === location.pathname && info === prevInfo)
        history.replaceState(null, "", to);
      else {
        history.pushState(null, "", to);
        route(info); // 여기서 route함수를 참조하므로 이 객체의 생명주기는 window 객체와 같습니다.
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
