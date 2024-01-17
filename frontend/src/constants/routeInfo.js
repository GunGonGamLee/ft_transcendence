import GameMode from '../pages/game-mode/page.js';
import Main from '../pages/main/page.js';
import Nickname from '../pages/nickname/page.js';
import histories from "../pages/histories/page.js";
import errorHeader from '../header/errorHeader/header.js';
export const BASE_URL = 'http://localhost:3000';
/**
 * 원하는 경로에 따라 렌더링할 컴포넌트를 정의합니다.
 */
export const routes = [
  { path: /^\/$/, page: Main, header: errorHeader },
  { path: /^\/nickname$/, page: Nickname, header: errorHeader },
  { path: /^\/gamemode$/, page: GameMode, header: errorHeader },
    {path: /^\/histories$/, page: histories, header: errorHeader}
]