import { navigate } from '../../utils/navigate.js';
import { importCss } from '../../utils/importCss.js';

/**
 * @param {HTMLElement} $container
 */
export default function Main($container) {
  this.$container = $container;

  this.setState = () => {
    this.render();
  };

  this.render = () => {
    importCss('../../../assets/css/main.css');
    this.$container.innerHTML = `
    <div class="main-component">
    <div class="title">ft_transcendence</div>
    <button type="button" class="btn btn-dark btn-signin" id="button">sign in with google</button>
    <button type="button" class="btn btn-dark btn-login" id="button2">42 login</button>
    <img class="background-img" src="../../../public/gamegi.png" />
</div>
    `;
  };

  this.render();

  // $container.addEventListener("click", (e) => {
  //   if (e.target.id === "loginBtn") {
  //     fetch("127.0.0.1:8000/api/login/42")
  //       .then((res) => {
  //         console.log(res);
  //         // todo: 쿼리 파라미터 받아서 로그인 된 건지 확인하고 navigate 해줘야함
  //         }
  //       )
  //       .catch((err) => console.error(err));
  //   }
  // })
}
