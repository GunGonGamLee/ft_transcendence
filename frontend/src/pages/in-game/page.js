import useState from "../../utils/useState.js";

export default function InGame($container) {

	const scoreInput = {player1: 0, player2: 0};
	let [getScore, setScore] = useState(scoreInput, this, 'renderScoreBoard');
	const init = () => {
		hideHeader();
		this.render();
		this.renderScoreBoard();
		addKeyEvents();
	}
	this.render = () => {
		$container.innerHTML = `
			<div style="position: fixed; top: 0; left:0; height: 12vh; width:100vw; background-color: black; display: flex; font-family: Galmuri11-Bold, serif; justify-content: space-between">
				<img alt="loading" src="../../../assets/images/avatar/luke_skywalker.png" style="height: 100%; margin-left: 5vw;">
				<div class="score-board" style="display: flex; flex-direction: column"></div>
				<img alt="loading" src="../../../assets/images/avatar/darth_vader.png" style="height: 100%; margin-right: 5vw;">
			</div>
			<div class="in-game" style="height: 100vh; width: 100vw; background-image: url('../../../assets/images/ingame_background.png'); background-size: cover">
			<div class="bar1" style="position: fixed; top: 50vh; left: 10vw; height: 12vh; width: 1vw; background-image: url('../../../assets/images/light_saber_green.png'); background-size: cover"></div>
			<div class="bar2" style="position: fixed; top: 50vh; left: 90vw; height: 12vh; width: 1vw; background-image: url('../../../assets/images/light_saber_yellow.png'); background-size: cover;"></div>
			<div class="ball" style="position: fixed; top: 50vh; left: 50vw; height: 4vh; width: 4vh; background-image: url('../../../assets/images/storm_trooper.png'); background-size: cover;"></div>
			`
	}
	this.renderScoreBoard = () => {
		$container.querySelector(".score-board").innerHTML = `
				<span style="color: yellow; font-size: 2em; margin: auto;">${getScore().player1} 대 ${getScore().player2}</span>
		`
	}
	const hideHeader = () => {
		document.querySelector("#header").style.display = "none";
	}
	const addKeyEvents = () => {
		// TODO: window에 추가한 이벤트라 리소스 누수가 발생할 수 있음 (컴포넌트 제거 시 이벤트 제거 필요)
		window.addEventListener("keydown", (e) => {
			if (e.key === "w" || e.key === "W") {
				$container.querySelector(".bar1").style.top = `${parseInt($container.querySelector(".bar1").style.top) - 1}vh`;
			}
			else if (e.key === "s" || e.key === "S") {
				$container.querySelector(".bar1").style.top = `${parseInt($container.querySelector(".bar1").style.top) + 1}vh`;
			}
			else if (e.key === "ArrowUp") {
				$container.querySelector(".bar2").style.top = `${parseInt($container.querySelector(".bar2").style.top) - 1}vh`;
			} else if (e.key === "ArrowDown") {
				$container.querySelector(".bar2").style.top = `${parseInt($container.querySelector(".bar2").style.top) + 1}vh`;
			}
		})
	}

	init();
}