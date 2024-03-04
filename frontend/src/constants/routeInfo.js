import GameMode from "../pages/game-mode/page.js";
import Register from "../pages/register/page.js";
import { HistoriesDetails } from "../pages/histories/page.js";
import emptyHeader from "../header/emptyHeader/header.js";
import MainHeader from "../header/mainHeader/header.js";
import WaitingRoom from "../pages/waiting-room/page.js";
import Login from "../pages/login/page.js";
import CustomGameList from "../pages/custom-game-list/page.js";
import Auth from "../pages/auth/page.js";
import InGame from "../pages/in-game/page.js";
import Matchup from "../pages/match-up/page.js";
import Summary from "../pages/histories/summary-page.js";
import OneOnOneHistories from "../pages/histories/one-on-one-page.js";
import TournamentHistories from "../pages/histories/tournament-page.js";
/**
 * 원하는 경로에 따라 렌더링할 컴포넌트를 정의합니다.
 */
export const routes = [
  { path: /^\/$/, page: Login, header: emptyHeader },
  { path: /^\/auth(?:\?.*)?$/, page: Auth, header: emptyHeader },
  { path: /^\/register$/, page: Register, header: emptyHeader },
  { path: /^\/game-mode$/, page: GameMode, header: MainHeader },

  {
    path: /^\/histories\/summary$/,
    page: Summary.bind(),
    header: MainHeader,
  },
  {
    path: /^\/histories\/casual\/one-on-one$/,
    page: OneOnOneHistories.bind(null, "casual_1vs1"),
    header: MainHeader,
  },
  {
    path: /^\/histories\/casual\/tournament$/,
    page: TournamentHistories,
    header: MainHeader,
  },
  {
    path: /^\/histories\/rank\/tournament?$/,
    page: TournamentHistories,
    header: MainHeader,
  },
  {
    path: /^\/histories\/details(?:\?.*)?$/,
    page: HistoriesDetails,
    header: MainHeader,
  },

  { path: /^\/waiting-room$/, page: WaitingRoom, header: MainHeader },
  { path: /^\/custom-game-list$/, page: CustomGameList, header: MainHeader },
  { path: /^\/in-game$/, page: InGame, header: MainHeader },
  { path: /^\/match-up$/, page: Matchup, header: MainHeader },
];
