export default function scoreBar(info) {
  let player1 = null;
  let player2 = null;
  if (info.finalPlayer1 === null) {
    player1 = info.player1;
    player2 = info.player2;
  } else if (info.finalPlayer2 === null) {
    player1 = info.player3;
    player2 = info.player4;
  } else {
    player1 = info.finalPlayer1;
    player2 = info.finalPlayer2;
  }

  return `
	<div style="position: fixed; top: 0; left:0; height: 12vh; width:100vw; background-color: black; display: flex; font-family: Galmuri11-Bold, serif; justify-content: space-between; align-items: center">
    <div class="left-unit" style="width: 30vw; height: 12vh; display: flex; align-items: center">
    	<span style="display: inline-block; color: yellow; font-size: x-large; font-family: Galmuri11-Bold, serif; margin-left: 2vw">${player1}</span>
    </div>
    <div class="score-board"></div>
    <div class="right-unit" style="width: 30vw; height: 12vh; display: flex; flex-direction: row; align-items: center; justify-content: end">    
    	<img alt="loading" src="../../../assets/images/clock.png" style="height: 4vh"> 
    	<span class="time" style="color: white; font-size: x-large; font-family: Galmuri11, serif; margin-right: 10vh; margin-bottom: 1vh; display: inline-block; width: 50px; height: 20px;">0:00</span>                    
   		<span style="display: inline-block; color: yellow; font-size: x-large; font-family: Galmuri11-Bold, serif; margin-right: 2vw">${player2}</span>
    </div>
</div>

	`;
}
