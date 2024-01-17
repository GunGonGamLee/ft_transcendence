export default function oneOnOne($container) {
    this.$container = $container;

    this.setState = () => {
        this.render();
    }

    this.render = () => {
        if (document.getElementsByTagName("head") !== null) {
            document.getElementsByTagName("head")[0].insertAdjacentHTML(
                "beforeend",
                '<link rel="stylesheet" href="../../../../assets/css/histories/one_on_one.css"/>'
            );
        }
        this.$container.innerHTML = `
        <div class="histories" id="content-wrapper">d
        </div>
        `;
    }

    this.render();
}