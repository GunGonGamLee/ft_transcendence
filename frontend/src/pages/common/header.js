import Router from "../../router.js";

/**
 * header 컴포넌트
 * @param {HTMLElement} $container
 */
export default function header($container) {
  this.$container = $container;

  const init = () => {
    new Router($container);
  };

  init();
}