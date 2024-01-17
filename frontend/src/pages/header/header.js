import Router from "../../router.js";
import HistoriesHeader from "./historiesHeader.js";

/**
 * header 컴포넌트
 * @param {HTMLElement} $container
 */
export default function header($container) {
    this.$container = $container;

    const init = () => {
        new Router($container);
    };

    const render = () => {
        this.$container.innerHTML = `
        `;
    }

    init();
    switch (location.pathname) {
        case "/histories":
            new HistoriesHeader($container);
            break;
        default:
            render();
            break;
    }
}