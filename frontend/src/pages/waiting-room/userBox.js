import userUnit from './userUnit.js';

/**
 * @param {number} gameMode 2인용, 4인용
 */
export default function userBox(gameMode) {
    const props = [{img: '../../../assets/images/avatar/red_bust.png', nickname: 'donghyk2', rating: 2400, status: '오우-너', color: 'yellow'},
        {img: '../../../assets/images/avatar/blue_bust.png', nickname: 'john', rating: 2200, status: '준비 중', color: 'white'},
        {img: '../../../assets/images/avatar/yellow_bust.png', nickname: 'bob', rating: 2300, status: '준비 중', color: 'white'},
        {img: '../../../assets/images/avatar/green_bust.png', nickname: 'garry', rating: 2300, status: '준비 중', color: 'white'}];
    if (gameMode === 2) {
    return (`
        <div class="user-box-wrapper" style="; width: 100vw; height: 65vh; display : flex; flex-direction: row">
          <div class="spacer28" style="width: 28vw; height: 65vh"></div>  
          ${userUnit(props[0])}
          <div style="display: flex; justify-content: center; flex-direction: column; align-items: center; width: 4vw; height: 65vh;">
            <img alt="user" src="../../../assets/images/1vs1_logo.png" class="spacer28" style="width: 4vw; height: 8vh">
          </div>
          ${userUnit(props[1])}
          <div class="spacer28" style="width: 28vw; height: 65vh"></div>  
        </div>
    `);
    } else {
        return (`
         <div class="user-box-wrapper" style="width: 100vw; height: 65vh; display : flex; flex-direction: row">
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
          ${userUnit(props[3])}
          <div class="spacer" style="width: 4vw; height: 65vh"></div>
        </div>
        `)
    }
}
