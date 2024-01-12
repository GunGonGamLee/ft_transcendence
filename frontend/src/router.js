import { routes } from "./constants/routeInfo.js";
import NotFound from "./pages/notfound.js";

export default function Router($container) {
  this.$container = $container;
  let currentPage = undefined;

  const findMatchedRoute = () =>
    routes.find((route) => route.path.test(location.pathname));

  const route = () => {
    currentPage = null;
    const TargetPage = findMatchedRoute()?.element || NotFound; // 현재 경로에 따라 렌더링할 컴포넌트를 정의합니다.
    currentPage = new TargetPage(this.$container);
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
