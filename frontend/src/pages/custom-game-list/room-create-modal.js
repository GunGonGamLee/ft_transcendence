export default function roomCreateModal(isVisible) {
  let display = "none";
  if (isVisible) display = "flex";
  return `
       <div id="room-create-modal-wrapper" style="display: ${display}; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 860px; height: 500px; background: rgba(10, 10, 10, 0.95); border-radius: 25px; border: 5px #FBFF3E solid;">
          <div style="position: absolute; left: 52px; top: 43px; text-align: center; color: white; font-size: 40px; font-family: Galmuri11, serif; font-weight: 400; word-wrap: break-word;">사용자 모드 방 만들기</div>
          <img id="room-create-modal-close" alt="setting" style="position: absolute; width: 70px; height: 70px; left: 770px; top: 26px;" src="../../../assets/images/close.png" />
          <div style="position: absolute; width: 751px; height: 62px; left: 66px; top: 126px;">
            <div style="position: absolute; top: 10px; text-align: center; color: white; font-size: 36px; font-family: Galmuri11, serif; font-weight: 400;">방 이름</div>
            <input id="room-name-input" type="text" name="roomName" maxlength="10" placeholder="최대 10글자" style="position: absolute; width: 553px; height: 62px; left: 198px; border-radius: 10px; border: 3px white solid; background: transparent; color: white; font-size: 36px; font-family: Galmuri11, serif; font-weight: 400; padding-left: 14px;">
          </div>
          <div style="position: absolute; width: 528px; height: 51px; left: 60px; top: 223px;">
            <div id="tournament-toggle-btn" style="position: absolute; left: 384px; top: 3px; opacity: 0.50; text-align: center; color: white; font-size: 36px; font-family: Galmuri11, serif; font-weight: 400;">토너먼트</div>
            <div id="1vs1-toggle-btn" style="position: absolute; left: 202px; text-align: center; color: white; font-size: 36px; font-family: Galmuri11, serif; font-weight: 400;">1 vs 1</div>
            <div style="position: absolute; top: 3px; text-align: center; color: white; font-size: 36px; font-family: Galmuri11, serif; font-weight: 400;">모드 선택</div>
          </div>
          <div style="position: relative; width: 753px; height: 62px; left: 64px; top: 300px;">
            <div style="position: absolute; top: 11px; text-align: center; color: white; font-size: 36px; font-family: Galmuri11, serif; font-weight: 400;">암호</div>
            <input id="password-input" type="password" name="password" maxlength="10" style="position: absolute; width: 553px; height: 62px; left: 200px; border-radius: 10px; border: 3px white solid; background: transparent; color: white; font-size: 36px; font-family: Galmuri11, serif; font-weight: 400; padding-left: 14px;">
          </div>
          <div style="position: absolute; width: 167px; height: 62px; left: 349px; top: 397px;">
              <div style="background: rgba(251.14, 255, 62, 0.20); border-radius: 10px; border: 5px #FBFF3E solid; width: 100%; height: 100%;"></div>
              <div id="make-room-btn" style="position: absolute; left: 32px; top: 9px; text-align: center; color: white; font-size: 36px; font-family: Galmuri11, serif; font-weight: 400;">만들기</div>
          </div>
      </div>
    `;
}
