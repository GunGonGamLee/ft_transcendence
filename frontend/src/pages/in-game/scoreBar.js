export default function scoreBar() {
  return `
	<div style="position: fixed; top: 0; left:0; height: 12vh; width:100vw; background-color: black; display: flex; font-family: Galmuri11-Bold, serif; justify-content: space-between; align-items: center">
    <div class="left-unit" style="width: 30vw; height: 12vh">
    	<img alt="loading" src="../../../assets/images/avatar/luke_skywalker.png" style="height: 100%; margin-left: 5vw;">
    </div>
    <div class="score-board"></div>
    <div class="right-unit" style="width: 30vw; height: 12vh; display: flex; flex-direction: row; align-items: center; justify-content: end">    
    	<img alt="loading" src="../../../assets/images/clock.png" style="height: 4vh"> 
    	<span class="time" style="color: white; font-size: 3vh; font-family: Galmuri11, serif; margin-right: 10vh; margin-bottom: 1vh; display: inline-block; width: 50px; height: 20px;">0:00</span>                    
   		<img alt="loading" src="../../../assets/images/avatar/darth_vader.png" style="height: 100%; margin-right: 5vw;">
    </div>
</div>

	`;
}
