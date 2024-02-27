import GameMode from "../pages/game-mode/page.js";
import Register from "../pages/register/page.js";
import Histories from "../pages/histories/page.js";
import RegisterHeader from "../header/registerHeader/header.js";
import MainHeader from "../header/mainHeader/header.js";
import WaitingRoom from "../pages/waiting-room/page.js";
import Login from "../pages/login/page.js";
import CustomGameList from "../pages/custom-game-list/page.js";
import Auth from "../pages/auth/page.js";
import InGame from "../pages/in-game/page.js";
import Tournament from "../pages/tournament/page.js";

/**
 * 원하는 경로에 따라 렌더링할 컴포넌트를 정의합니다.
 */
export const routes = [
  { path: /^\/$/, page: Login, header: RegisterHeader },
  { path: /^\/auth(?:\?.*)?$/, page: Auth, header: RegisterHeader },
  { path: /^\/register$/, page: Register, header: RegisterHeader },
  { path: /^\/game-mode$/, page: GameMode, header: MainHeader },
  { path: /^\/histories$/, page: Histories, header: MainHeader },
  { path: /^\/waiting-room$/, page: WaitingRoom, header: MainHeader },
  { path: /^\/custom-game-list$/, page: CustomGameList, header: MainHeader },
  { path: /^\/in-game$/, page: InGame, header: MainHeader },
  { path: /^\/tournament$/, page: Tournament, header: MainHeader },
];
