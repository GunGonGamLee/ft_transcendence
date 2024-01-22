import GameMode from '../pages/game-mode/page.js';
import Main from '../pages/main/page.js';
import Nickname from '../pages/nickname/page.js';
import Histories from "../pages/histories/page.js";
import NicknameHeader from '../header/nicknameHeader/header.js';
import MainHeader from '../header/mainHeader/header.js';
import HistoriesHeader from '../header/mainHeader/header.js';

export const BASE_URL = 'http://localhost:3000';
/**
 * 원하는 경로에 따라 렌더링할 컴포넌트를 정의합니다.
 */
export const routes = [
  { path: /^\/$/, page: Main, header: MainHeader },
  { path: /^\/nickname$/, page: Nickname, header: NicknameHeader },
  { path: /^\/game-mode$/, page: GameMode, header: MainHeader },
  { path: /^\/histories$/, page: Histories, header: MainHeader}
]
