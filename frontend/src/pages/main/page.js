import { navigate } from "../../utils/navigate.js";

/**
 * @param {HTMLElement} $container
 */
export default function Main($container) {
  this.$container = $container;

  this.setState = () => {
    this.render();
  };

  this.render = () => {
    this.$container.innerHTML = `
    <button id="button">go to makeNickname</button>
    <button id="loginBtn">42login</button>
    `;
  };

  this.render();
  $container.addEventListener("click", (e) => {
    if (e.target.id === "button") {
      navigate("/makeNickname")
    }
  })
  $container.addEventListener("click", (e) => {
    if (e.target.id === "loginBtn") {
      fetch("127.0.0.1:8000/api/login/42")
        .then((res) => {
          console.log(res);
          // todo: 쿼리 파라미터 받아서 로그인 된 건지 확인하고 navigate 해줘야함
          }
        )
        .catch((err) => console.error(err));
    }
  })
}
