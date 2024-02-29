import {importCss} from "../../utils/importCss.js";

export default function Matchup($container, info = null) {
  if (info === null) {
    return;
  }
  console.log(info);
  console.log(info.data.data.match1);
  console.log("매치 인원")
  // console.log(info.data.data.match1.length());
  const ws = info.socket;
  ws.onmessage = (msg) => {
    let data = JSON.parse(msg.data);
    console.log(data);
    console.log("here1");
    console.log(data.data.match);
    console.log("here2");
    console.log(data.data.match1);
  };

  const init = () => {
    renderSemifinal();
    // renderFinal();
  };

  this.unmount = () => {
    // ws.close();
  };
  
  const renderSemifinal = () => {
    importCss("../../../assets/css/semi-final.css");

    $container.innerHTML = `
        <div class="background-wrapper">
        </div>
        <div class="tournament-wrapper">
            <div class="left-tournament-info-wrapper">
                <div class="card-wrapper">
                    <div class="user-avatar">
                        <img src="../../../assets/images/avatar/darth_vader.png">
                    </div>
                    <div class="user-name">hyojocho</div>
                    <div class="user-rating">Rating: 1,000</div>
                </div>
                <div class="card-wrapper">
                    <div class="user-avatar">
                        <img src="../../../assets/images/avatar/darth_vader.png">
                    </div>
                    <div class="user-name">hyojocho</div>
                    <div class="user-rating">Rating: 1,000</div>
                </div>
            </div>
            <div class="first-middle-tournament-info-wrapper">
                <div class="top-line-wrapper">
                </div>
                <div class="middle-line-wrapper">
                </div>
                <div class="bottom-line-wrapper">
                </div>
            </div>
            <div class="second-middle-tournament-info-wrapper">
                <div class="second-side-wrapper">
                </div>
                <div id="trophy-wrapper">
                    <img src="../../../assets/images/tournament_logo.png">
                </div>
                <div class="second-side-wrapper">
                </div>
            </div>
            <div class="third-tournament-info-wrapper">
                <div class="top-line-wrapper">
                </div>
                <div class="middle-line-wrapper">
                </div>
                <div class="bottom-line-wrapper">
                </div>
            </div>
            <div class="right-tournament-info-wrapper">
                <div class="card-wrapper">
                    <div class="user-avatar">
                        <img src="../../../assets/images/avatar/darth_vader.png">
                    </div>
                    <div class="user-name">hyojocho</div>
                    <div class="user-rating">Rating: 1,000</div>
                </div>
                <div class="card-wrapper">
                    <div class="user-avatar">
                        <img src="../../../assets/images/avatar/darth_vader.png">
                    </div>
                    <div class="user-name">hyojocho</div>
                    <div class="user-rating">Rating: 1,000</div>
                </div>
            </div>
        </div>
		`;
  };

  const renderFinal = () => {
    importCss("../../../assets/css/final.css");

    $container.innerHTML = `
        <div class="background-wrapper">
        </div>
        <div class="tournament-wrapper">
            <div class="left-tournament-info-wrapper">
                <div class="card-wrapper">
                    <div class="user-avatar">
                        <img src="../../../assets/images/avatar/darth_vader.png">
                    </div>
                    <div class="user-name">hyojocho</div>
                    <div class="user-rating">Rating: 1,000</div>
                </div>
            </div>
            
            <div class="second-middle-tournament-info-wrapper">
                <div id="trophy-wrapper">
                    <img src="../../../assets/images/tournament_logo.png">
                </div>
            </div>
            
            <div class="right-tournament-info-wrapper">
                <div class="card-wrapper">
                    <div class="user-avatar">
                        <img src="../../../assets/images/avatar/darth_vader.png">
                    </div>
                    <div class="user-name">hyojocho</div>
                    <div class="user-rating">Rating: 1,000</div>
                </div>
                
            </div>
        </div>
		`;
  }

  init();
}
