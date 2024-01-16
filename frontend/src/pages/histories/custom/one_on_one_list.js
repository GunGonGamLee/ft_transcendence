export default function oneOnOne($container) {
    this.$container = $container;

    this.setState = () => {
        this.render();
    }

    this.render = () => {

    }

    this.render();
}