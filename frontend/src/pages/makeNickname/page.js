import { navigate } from "../../utils/navigate.js";

/**
 * @param {HTMLElement} $container
 */
export default function makeNickname($container) {
	this.$container = $container;

	this.setState = () => {
	  this.render();
	};

	this.render = () => {
	  this.$container.innerHTML = `
	  <button id="button1">go to chooseGameMode</button>
	  `;
	};

	this.render();
	$container.addEventListener("click", (e) => {
		if (e.target.id === "button1") {
		  navigate("/chooseGameMode")
		}
	  })
  }
