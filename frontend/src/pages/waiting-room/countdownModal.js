export default function countdownModal(isVisible) {
  let display = "none";
  if (isVisible) display = "flex";
  return `
        <div class="count-down-modal-wrapper"  style="width: 100vw; height: 100vh; display: ${display}; justify-content: center; align-items: center; position: fixed; top: 0; left: 0;">
          <div style="width: 860px; height: 500px; background: rgba(10, 10, 10, 0.95); border-radius: 25px; border: 5px #FF77C5 solid; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative;">
            <div style="text-align: center; color: white; font-size: 48px; font-family: Galmuri11, serif; font-weight: 700; word-wrap: break-word">잠시 후 게임이 시작된다.</div>
            <div class="countdown" style="text-align: center; color: white; font-size: 48px; font-family: Galmuri11, serif; font-weight: 700; word-wrap: break-word; position: absolute; bottom: 100px;">5</div>
          </div>
        </div>  
    `;
}
