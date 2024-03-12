import { importCss } from "../../utils/importCss.js";
import useState from "../../utils/useState.js";
import { navigate } from "../../utils/navigate.js";

export default function Matchup($container, info = null) {
  if (info === null) {
    navigate("/game-mode");
    return;
  }
  // 이전 페이지로 부터 받아온 정보 처리
  const ws = info.socket;
  ws.onmessage = null;
  // ws.onmessage = (msg) => {
  //   let data = JSON.parse(msg.data);
  //   let matchData = [];
  //
  //   // 파이널 대기 때 받아올 데이터 set
  //   if (info.data.data.match3) {
  //     renderFinal();
  //     matchData.concat(info.data.data.match3);
  //   } else {
  //     console.error("No match data available");
  //   }
  //   setCards(info.data.data.match3);
  // };

  const init = () => {
    let matchData = [];

    if (info.data.data.match1 && info.data.data.match2) {
      renderSemifinal();
      matchData = matchData.concat(info.data.data.match1);
      matchData = matchData.concat(info.data.data.match2);
    } else if (info.data.data.match3) {
      renderFinal();
      matchData = matchData.concat(info.data.data.match3);
    } else {
      console.error("No match data available");
    }

    // if (matchData.length > 0) {
    setCards(matchData);
    // }

    // // 5초 후에 local-game 경로로 자동 이동
    // setTimeout(() => {
    //   navigate("/local-game");
    // }, 5000); // 5000밀리초는 5초를 의미합니다.
  };

  this.unmount = () => {
    // ws.close();
  };

  this.renderCards = () => {
    const cardsData = getCards();

    const cardsArray = Object.values(cardsData);

    const cardWrappers = document.querySelectorAll(".card-wrapper");

    cardsArray.forEach((cardData, index) => {
      if (index < cardWrappers.length) {
        const { nickname, avatar, rating } = cardData;
        cardWrappers[index].innerHTML = `
        <div class="user-avatar">
            <img src="../../../assets/images/avatar/${avatar}">
        </div>
        <div class="user-name">${nickname}</div>
        <div class="user-rating">Rating: ${rating}</div>
      `;
      }
    });
  };

  const renderSemifinal = () => {
    importCss("../../../assets/css/semi-final.css");

    $container.innerHTML = `
        <div class="background-wrapper">
        </div>
        <div class="tournament-wrapper">
            <div class="left-tournament-info-wrapper">
                <div class="card-wrapper">
                    
                </div>
                <div class="card-wrapper">
                    
                </div>
            </div>
            <div class="first-middle-tournament-info-wrapper">
                <div class="top-line-wrapper">
                </div>
                <div class="middle-line-wrapper">
                </div>
                <div class="bottom-line-wrapper">
                </div>
            </div>
            <div class="second-middle-tournament-info-wrapper">
                <div class="second-side-wrapper">
                </div>
                <div id="trophy-wrapper">
                    <img src="../../../assets/images/tournament_logo.png">
                </div>
                <div class="second-side-wrapper">
                </div>
            </div>
            <div class="third-tournament-info-wrapper">
                <div class="top-line-wrapper">
                </div>
                <div class="middle-line-wrapper">
                </div>
                <div class="bottom-line-wrapper">
                </div>
            </div>
            <div class="right-tournament-info-wrapper">
                <div class="card-wrapper">
                    
                </div>
                <div class="card-wrapper">
                    
                </div>
            </div>
        </div>
		`;
  };

  const renderFinal = () => {
    importCss("../../../assets/css/final.css");

    $container.innerHTML = `
        <div class="background-wrapper">
        </div>
        <div class="tournament-wrapper">
            <div class="left-tournament-info-wrapper">
                <div class="card-wrapper">
                </div>
            </div>
            <div class="second-middle-tournament-info-wrapper">
                <div id="trophy-wrapper">
                    <img src="../../../assets/images/tournament_logo.png">
                </div>
            </div>
            <div class="right-tournament-info-wrapper">
                <div class="card-wrapper">
                </div>
            </div>
        </div>
		`;
  };

  let [getCards, setCards] = useState({}, this, "renderCards");

  init();
  setTimeout(() => {
    ws.onmessage = null;
    navigate("/online-game", { socket: ws, data: info.data });
  }, 5000);
}
