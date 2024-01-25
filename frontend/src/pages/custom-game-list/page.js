import {click} from "../../utils/clickEvent.js"
import {importCss} from '../../utils/importCss.js';


export default function CustomGameList($container) {
    this.$container = $container;

    this.setState = () => {
        this.render();
    }

    this.render = () => {
        this.renderLayout();
    }

    this.renderLayout = () => {
    }
}