import useState from "../../utils/useState.js";
import scoreBar from "./scoreBar.js";

export default function InGame($container) {

	const scoreInput = {player1: 0, player2: 0};
	let [getScore, setScore] = useState(scoreInput, this, 'renderScoreBoard');
	const init = () => {
		hideHeader();
		this.render();
		this.renderScoreBoard();
		addKeyEvents();
	}
	// TODO: 다른 페이지로 이동 시 이벤트 제거, mainheader 보이게 수정
	this.render = () => {
		$container.innerHTML = `
			${scoreBar()}
			<div class="in-game" style="height: 100vh; width: 100vw; background-image: url('../../../assets/images/ingame_background.png'); background-size: cover">
			<div class="bar1" style="position: fixed; top: 40vh; left: 10vw; height: 20vh; width: 1vw; background-image: url('../../../assets/images/light_saber_green.png'); background-size: cover"></div>
			<div class="bar2" style="position: fixed; top: 40vh; left: 90vw; height: 20vh; width: 1vw; background-image: url('../../../assets/images/light_saber_yellow.png'); background-size: cover;"></div>
			<div class="ball" style="position: fixed; top: 48vh; left: 48vw; height: 4vh; width: 4vh; background-image: url('../../../assets/images/storm_trooper.png'); background-size: cover;"></div>
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
			if (e.key === "w" || e.key === "W" || e.key === 'ㅈ') {
				const currentTop = parseInt($container.querySelector(".bar1").style.top);
				if (currentTop <= 12) return;
				$container.querySelector(".bar1").style.top = `${currentTop - 1}vh`;
			}
			else if (e.key === "s" || e.key === "S" || e.key === 'ㄴ') {
				const currentTop = parseInt($container.querySelector(".bar1").style.top);
				if (currentTop >= 80) return;
				$container.querySelector(".bar1").style.top = `${currentTop + 1}vh`;
			} // TODO: 2p 아닐땐 아래 이벤트리스너 실행 안되게 수정
			else if (e.key === "ArrowUp") {
				const currentTop = parseInt($container.querySelector(".bar2").style.top);
				if (currentTop <= 12) return;
				$container.querySelector(".bar2").style.top = `${currentTop - 1}vh`;
			} else if (e.key === "ArrowDown") {
				const currentTop = parseInt($container.querySelector(".bar2").style.top);
				if (currentTop >= 80) return;
				$container.querySelector(".bar2").style.top = `${currentTop + 1}vh`;
			}
		})
	}

	init();
}