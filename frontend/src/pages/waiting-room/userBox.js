import userUnit from "./userUnit.js";

/**
 * @param {number} gameMode 2인용, 4인용
 * @param {array} props 유저 정보
 */
export default function userBox(gameMode, props) {
  if (gameMode === 2) {
    return `
          <div class="spacer28" style="width: 28vw; height: 65vh"></div>  
          ${userUnit(props[0])}
          <div style="display: flex; justify-content: center; flex-direction: column; align-items: center; width: 4vw; height: 65vh;">
            <img alt="user" src="../../../assets/images/1vs1_logo.png" class="spacer28" style="width: 4vw; height: 8vh">
          </div>
          ${userUnit(props[1])}
          <div class="spacer28" style="width: 28vw; height: 65vh"></div>  
    `;
  } else {
    return `
          <div class="spacer" style="width: 4vw; height: 65vh"></div>
          ${userUnit(props[0])}
          <div style="display: flex; justify-content: center; flex-direction: column; align-items: center; width: 4vw; height: 65vh;">
            <img alt="user" src="../../../assets/images/1vs1_logo.png" class="spacer28" style="width: 4vw; height: 8vh">
          </div>
          ${userUnit(props[1])}
          <div class="spacer" style="width: 4vw; height: 65vh"></div>  
          ${userUnit(props[2])}
          <div style="display: flex; justify-content: center; flex-direction: column; align-items: center; width: 4vw; height: 65vh;">
            <img alt="user" src="../../../assets/images/1vs1_logo.png" class="spacer28" style="width: 4vw; height: 8vh">
          </div>
          ${userUnit(null)}
          <div class="spacer" style="width: 4vw; height: 65vh"></div>
        `;
  }
}
