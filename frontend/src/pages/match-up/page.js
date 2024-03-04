import {importCss} from "../../utils/importCss.js";
import useState from "../../utils/useState.js";
import { navigate } from "../../utils/navigate.js";

export default function Matchup($container, info = null) {
  if (info === null) {
    return;
  }
  // 이전 페이지로 부터 받아온 정보 처리
  const ws = info.socket;
  ws.onmessage = (msg) => {
    let data = JSON.parse(msg.data);
    console.log(data);
    // 파이널 대기 때 받아올 데이터 set
    setCards(data.data.data.match3);
  };

  const init = () => {
    // match1, match2, match3 중 어느 것이 있는지 확인
    let matchData;
    let matchType;

    console.log(info);

    if (info.data.data.match1) {
      matchData = info.data.data.match1;
      matchType = 'match1';
    } else if (info.data.data.match2) {
      matchData = info.data.data.match2;
      matchType = 'match2';
    } else {
      // 매치 정보가 없는 경우 처리
      console.error('No match data available');
      return;
    }

    // 매치 데이터의 길이에 따라 적절한 렌더링 함수 호출
    switch (matchData.length) {
      case 2:
        renderFinal(matchType);
        break;
      case 4:
        renderSemifinal(matchType);
        break;
      default:
        console.error('Unexpected match data length:', matchData.length);
        break;
    }

    setCards(info.data.data.match1);

    // 5초 후에 in-game 경로로 자동 이동
    setTimeout(() => {
      navigate("/in-game");
    }, 5000); // 5000밀리초는 5초를 의미합니다.
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
        const {nickname, avatar, rating} = cardData;
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
  }

  let [getCards, setCards] = useState({}, this, "renderCards");

  init();
}
