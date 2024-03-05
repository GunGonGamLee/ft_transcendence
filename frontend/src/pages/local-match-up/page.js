import playerNameInput from "./playerNameInput.js";
import { click } from "../../utils/clickEvent.js";
import { navigate } from "../../utils/navigate.js";
import { importCss } from "../../utils/importCss.js";
export default function LocalMatchup($container, info = null) {
  // TODO: router 에서 info를 참조로 비교하므로 구조분해할당 후 넘겨야할듯
  info = {
    curMatch: 1,
    match: {
      player1: "",
      player2: "",
      player3: "",
      player4: "",
      player5: null,
      player6: null,
    },
  };

  const init = () => {
    render();
    for (let i = 1; i <= 4; i++) {
      $container
        .querySelector(`.player-name-input-${i}`)
        .addEventListener("input", (e) => {
          info.match[`player${i}`] = e.target.value;
        });
    }
    click($container.querySelector(".start-btn"), () => {
      for (let i = 1; i <= 4; i++) {
        if (info.match[`player${i}`] === "") {
          // alert(`${i}P 이름을 입력해주세요`);
          const $input = $container.querySelector(`.player-name-input-${i}`);
          $input.focus();
          $input.classList.add("shake-animation");
          // 애니메이션 보여준 후 제거
          $input.addEventListener("animationend", () => {
            $input.classList.remove("shake-animation");
          });
          return;
        }
      }
      navigate("/in-game", info);
    });
  };

  const render = () => {
    importCss("../../../assets/css/localMatchUp.css");
    $container.innerHTML = `
      <div style="height: 100%; width: 100%; flex-direction: column; display: flex; justify-content: center; align-items: center; background-image: url('../../../assets/images/ingame_background4.png'); background-size: cover">
        ${playerNameInput(1)}
        ${playerNameInput(2)}  
        ${playerNameInput(3)}  
        ${playerNameInput(4)}
        <button class="start-btn" style="background: linear-gradient(to bottom, #D80000, #FF0000); font-family: Galmuri11-Bold, serif; color: white; border: 4px solid darkred; padding: 10px 40px; text-align: center; text-decoration: none; font-size: 32px; margin: 4px 2px; cursor: pointer; border-radius: 5vh;">START</button>
      </div>
    `;
  };

  init();
}
