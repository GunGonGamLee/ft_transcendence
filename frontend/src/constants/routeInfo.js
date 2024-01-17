import GameMode from '../pages/game-mode/page.js';
import Main from '../pages/main/page.js';
import Nickname from '../pages/nickname/page.js';

export const BASE_URL = 'http://localhost:3000';
/**
 * 원하는 경로에 따라 렌더링할 컴포넌트를 정의합니다.
 * @type {{path: RegExp, element: string}[]}
 */
export const routes = [
  { path: /^\/$/, element: Main },
  { path: /^\/nickname$/, element: Nickname },
  { path: /^\/gamemode$/, element: GameMode },
];
