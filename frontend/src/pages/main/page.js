import { navigate } from '../../utils/navigate.js';

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
    <div style="width: 100vw; height: 100vh; position: relative; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center">
    <div style="font-size: 26px; margin-bottom: 14vh" >ft_transcendence</div>
    <button type="button" class="btn btn-dark" style="margin-bottom: 6px;" id="button">sign in with google</button>
    <button type="button" class="btn btn-dark" style="margin-bottom: 53vh; padding-left: 50px; padding-right: 50px" id="button2">42 login</button>
    <img style="width: 60vw; height: 100vh; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);" src="../../../public/gamegi.png" />
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
