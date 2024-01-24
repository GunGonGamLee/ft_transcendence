import GameMode from '../pages/game-mode/page.js';
import Register from '../pages/register/page.js';
import Histories from "../pages/histories/page.js";
import RegisterHeader from '../header/registerHeader/header.js';
import MainHeader from '../header/mainHeader/header.js';
import Login from '../pages/login/page.js'

/**
 * 원하는 경로에 따라 렌더링할 컴포넌트를 정의합니다.
 */
export const routes = [
  { path: /^\/$/, page: Login, header: RegisterHeader },
  { path: /^\/register$/, page: Register, header: RegisterHeader },
  { path: /^\/game-mode$/, page: GameMode, header: MainHeader },
  { path: /^\/histories$/, page: Histories, header: MainHeader}
]
