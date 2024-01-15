import chooseGameMode from "../pages/chooseGameMode/page.js";
import Main from "../pages/main/page.js";
import makeNickname from "../pages/makeNickname/page.js";

export const BASE_URL = "http://localhost:3000";
/**
 * 원하는 경로에 따라 렌더링할 컴포넌트를 정의합니다.
 * @type {{path: RegExp, element: string}[]}
 */
export const routes = [
  { path: /^\/$/, element: Main },
  { path: /^\/makeNickname$/, element: makeNickname },
  { path: /^\/chooseGameMode$/, element: chooseGameMode },
];
