import GameMode from '../pages/game-mode/page.js';
import Main from '../pages/main/page.js';
import Nickname from '../pages/nickname/page.js';
import histories from "../pages/histories/page.js";
import historiesHeader from '../header/historiesHeader/header.js';
import nicknameHeader from '../header/nicknameHeader/header.js';
import mainHeader from '../header/mainHeader/header.js';
export const BASE_URL = 'http://localhost:3000';
/**
 * 원하는 경로에 따라 렌더링할 컴포넌트를 정의합니다.
 */
export const routes = [
  { path: /^\/$/, page: Main, header: nicknameHeader },
  { path: /^\/nickname$/, page: Nickname, header: nicknameHeader },
  { path: /^\/game-mode$/, page: GameMode, header: mainHeader },
  { path: /^\/histories$/, page: histories, header: historiesHeader}
]