import GameMode from '../pages/game-mode/page.js';
import Main from '../pages/main/page.js';
import Nickname from '../pages/nickname/page.js';
import Histories from "../pages/histories/page.js";
import nicknameHeader from '../header/nicknameHeader/header.js';
import mainHeader from '../header/mainHeader/header.js';
import errorHeader from '../header/errorHeader/header.js';
import HistoriesHeader from "../header/historiesHeader.js";

export const BASE_URL = 'http://localhost:3000';
/**
 * 원하는 경로에 따라 렌더링할 컴포넌트를 정의합니다.
 */
export const routes = [
  { path: /^\/$/, page: Main, header: nicknameHeader },
  { path: /^\/nickname$/, page: Nickname, header: nicknameHeader },
  { path: /^\/game-mode$/, page: GameMode, header: mainHeader },
  { path: /^\/histories$/, page: Histories, header: HistoriesHeader}
]
