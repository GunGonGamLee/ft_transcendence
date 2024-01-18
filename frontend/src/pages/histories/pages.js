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

        this.renderList();
    }

    this.renderList = () => {
        let list = document.getElementById("list");
        list.innerHTML = `
        <div class="histories" id="list-wrapper">asdfasdf</div>
        `
        let listWrapper = document.getElementById("list-wrapper");
        listWrapper.innerHTML = '';
        let mockData = [
            {
                player1: "hyojocho",
                player1_avatar: "../../../assets/images/avatar/red.png",
                player1_rating: 2130,
                player2: "yena",
                player2_avatar: "../../../assets/images/avatar/blue.png",
                player2_rating: 110,
                winner: "hyojocho",
            }
        ]; // TODO: 백엔드로부터 데이터 받아오기
        for (let data of mockData) {
            const listItemDiv = document.createElement("div");
            listItemDiv.className = "histories list-item";
            const player1Div = document.createElement("div");
            player1Div.className = "histories player";
            const gameModeDiv = document.createElement("div");
            gameModeDiv.className = "histories game-mode";
            const player2Div = document.createElement("div");
            player2Div.className = "histories player";
            player1Div.innerHTML = `
            <div class="histories avatar">
                <img class="histories" src="${data.player1_avatar}" alt="player1-avatar">
            </div>
            <div class="histories nickname">${data.player1}</div>
            <div class="histories rating">Rating: ${data.player1_rating}</div>
            `;
            gameModeDiv.innerHTML = `
            <img class="histories" src="../../../assets/images/1vs1_logo.png" alt="1v1">
            `;
            player2Div.innerHTML = `
            <div class="histories avatar">
                <img class="histories" src="${data.player2_avatar}" alt="player2-avatar">
            </div>
            <div class="histories nickname">${data.player2}</div>
            <div class="histories rating">Rating: ${data.player2_rating}</div>
            `;
            listItemDiv.appendChild(player1Div);
            listItemDiv.appendChild(gameModeDiv);
            listItemDiv.appendChild(player2Div);
            listWrapper.appendChild(listItemDiv);
        }
    }

    this.render();
}