export default function pages($container) {
    this.$container = $container;

    this.setState = () => {
        this.render();
    }

    this.render = () => {
        if (document.getElementsByTagName("head") !== null) {
            document.getElementsByTagName("head")[0].insertAdjacentHTML(
                "beforeend",
                '<link rel="stylesheet" href="../../../assets/css/histories.css"/>'

            );
        }
        this.$container.innerHTML = `
        <div class="histories" id="content-wrapper">
            <div class="histories" id="list"></div>
            <div class="histories" id="pagination">
                <a href="" class="histories" id="prev"></a>
                <a href="" class="histories" id="next"></a>
            </div>
            <div class="histories" id="mode">
                <div class="histories" id="summary">
                    <div class="histories icon"></div>
                    <div class="histories title">개요</div>
                </div>
                <div class="histories" id="custom">
                    <div class="histories icon"></div>
                    <div class="histories title">사용자 지정 모드</div>
                </div>
                <div class="histories" id="tournament">
                    <div class="histories icon"></div>
                    <div class="histories title">토너먼트 모드</div>
                </div>
            </div>
        </div>
        `;
    }

    this.render();
}