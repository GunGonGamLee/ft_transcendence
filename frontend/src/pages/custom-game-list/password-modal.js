export default function passwordModal(isVisible) {
  let display = "none";
  if (isVisible) display = "flex";
  return `
      <div id="password-modal-wrapper" style="display: ${display}; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 860px; height: 230px; background: rgba(10, 10, 10, 0.95); border-radius: 25px; border: 5px #FBFF3E solid;">
        <div style="position: absolute; left: 52px; top: 43px; text-align: center; color: white; font-size: 40px; font-family: Galmuri11, serif; font-weight: 400; word-wrap: break-word;">암호를 입력해라</div>
        <img id="password-modal-close" alt="setting" style="position: absolute; width: 70px; height: 70px; left: 770px; top: 26px;" src="../../../assets/images/close.png" />
        <div style="position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%);">
            <input id="pwd-input" type="text" name="password" maxlength="10" value="" style="width: 553px; height: 62px; border-radius: 10px; border: 3px white solid; background: transparent; color: white; font-size: 36px; font-family: Galmuri11, serif; font-weight: 400; padding-left: 14px;">
        </div>
      </div>
    `;
}
