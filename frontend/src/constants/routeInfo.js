import GameMode from '../pages/game-mode/page.js';
import Main from '../pages/main/page.js';
import Nickname from '../pages/nickname/page.js';
import Histories from "../pages/histories/page.js";
import emptyHeader from '../header/nicknameHeader/header.js';
import mainHeader from '../header/mainHeader/header.js';
import errorHeader from '../header/errorHeader/header.js';
import HistoriesHeader from "../header/historiesHeader/header.js";
import Login from '../pages/login/page.js';

export const BASE_URL = 'http://localhost:3000';
/**
 * 원하는 경로에 따라 렌더링할 컴포넌트를 정의합니다.
 */
export const routes = [
  { path: /^\/$/, page: Login, header: emptyHeader },
  { path: /^\/nickname$/, page: Nickname, header: emptyHeader },
  { path: /^\/game-mode$/, page: GameMode, header: mainHeader },
  { path: /^\/histories$/, page: Histories, header: HistoriesHeader}
]
