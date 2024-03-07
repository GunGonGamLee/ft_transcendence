import GameMode from "../pages/game-mode/page.js";
import Register from "../pages/register/page.js";
import { HistoriesDetails } from "../pages/histories/page.js";
import emptyHeader from "../header/emptyHeader/header.js";
import MainHeader from "../header/mainHeader/header.js";
import WaitingRoom from "../pages/waiting-room/page.js";
import Login from "../pages/login/page.js";
import CustomGameList from "../pages/custom-game-list/page.js";
import Auth from "../pages/auth/page.js";
import LocalGame from "../pages/local-game/page.js";
import Matchup from "../pages/match-up/page.js";
import Summary from "../pages/histories/summary-page.js";
import OneOnOneHistories from "../pages/histories/one-on-one-page.js";
import TournamentHistories from "../pages/histories/tournament-page.js";
import Avatar from "../pages/avatar/page.js";
import OnlineGame from "../pages/online-game/page.js";
import LocalMatchup from "../pages/local-match-up/page.js";

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
    page: Summary,
    header: MainHeader,
  },
  {
    path: /^\/histories\/casual\/one-on-one$/,
    page: OneOnOneHistories.bind(this, document.getElementById("app"), {
      mode: "casual_1vs1",
    }),
    header: MainHeader,
  },
  {
    path: /^\/histories\/casual\/tournament$/,
    page: TournamentHistories.bind(this, document.getElementById("app"), {
      mode: "casual_tournament",
    }),
    header: MainHeader,
  },
  {
    path: /^\/histories\/rank\/tournament$/,
    page: TournamentHistories.bind(this, document.getElementById("app"), {
      mode: "rank",
    }),
    header: MainHeader,
  },
  {
    path: /^\/histories\/details(?:\?.*)?$/,
    page: HistoriesDetails,
    header: MainHeader,
  },
  {
    path: /^\/avatar$/,
    page: Avatar,
    header: MainHeader,
  },

  { path: /^\/waiting-room$/, page: WaitingRoom, header: MainHeader },
  { path: /^\/custom-game-list$/, page: CustomGameList, header: MainHeader },
  { path: /^\/local-game$/, page: LocalGame, header: MainHeader },
  { path: /^\/online-game$/, page: OnlineGame, header: MainHeader },
  { path: /^\/match-up$/, page: Matchup, header: MainHeader },
  { path: /^\/local-match-up$/, page: LocalMatchup, header: MainHeader },
];
