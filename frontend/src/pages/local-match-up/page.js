import playerNameInput from "./playerNameInput.js";
import { click } from "../../utils/clickEvent.js";
import { navigate } from "../../utils/navigate.js";
import { importCss } from "../../utils/importCss.js";
import { BACKEND } from "../../global.js";
import { getCookie } from "../../utils/cookie.js";
export default function LocalMatchup($container, info = null) {
  info = {
    player1: "",
    player2: "",
    player3: "",
    player4: "",
    finalPlayer1: null,
    finalPlayer2: null,
  };

  const init = () => {
    render();
    for (let i = 1; i <= 4; i++) {
      $container
        .querySelector(`.player-name-input-${i}`)
        .addEventListener("input", (e) => {
          info[`player${i}`] = e.target.value;
        });
    }
    click($container.querySelector(".start-btn"), () => {
      for (let i = 1; i <= 4; i++) {
        if (info[`player${i}`] === "") {
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
      fetch(`${BACKEND}/games/local/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("jwt")}`,
        },
      });
      navigate("/local-game", info);
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
        <div style="display: flex; margin-bottom: 4vh; height: 10vh; width: 30vw; justify-content: center; align-items: center">
          <button class="start-btn" style="background: linear-gradient(to bottom, #D80000, #FF0000); font-family: Galmuri11-Bold, serif; color: white; border: 0.6vh solid darkred; padding: 1vw 4vh; text-align: center; text-decoration: none; font-size: 4vh; margin: 1vw 1vh; cursor: pointer; border-radius: 5vh;">START</button>
        </div>
      </div>
    `;
  };

  init();
}
