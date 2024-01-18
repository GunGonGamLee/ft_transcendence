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
                <a href="" class="histories" id="prev">
                    <img src="../../../assets/images/pagination.png" alt="prev">
                </a>
                <a href="" class="histories" id="next">
                    <img src="../../../assets/images/pagination.png" alt="next">
                </a>
            </div>
            <div class="histories" id="mode">
                <a class="histories" id="summary" href="">
                    <img class="histories" src="../../../assets/images/custom_summary.png" alt="summary">
                    개요
                </a>
                <a class="histories title" id="custom" href="">
                    <img class="histories" src="../../../assets/images/setting.png" alt="custom-mode">
                    사용자 지정 모드
                </a>
               <a class="histories title" id="tournament" href="">
                   <img class="histories" src="../../../assets/images/tournament_logo.png" alt="tournament">
                   토너먼트 모드
               </a>
            </div>
        </div>
        `;
    }

    this.render();
}