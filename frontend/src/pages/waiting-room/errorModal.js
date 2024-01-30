export default function errorModal(isVisible) {
  let display = "none";
  if (isVisible) display = "flex";
  return `
        <div style="display: ${display}; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 700px; height: 230px; background: rgba(10, 10, 10, 0.95); border-radius: 25px; border: 5px #FBFF3E solid;">
          <div style="position: absolute; color: white; font-size: 36px; font-family: Galmuri11, serif; font-weight: 400; left: 78px; top: 67px; word-wrap: break-word">방에서 퇴장 당했다<br/>억울하면 강해져라</div>
          <img alt="setting" style="position: absolute; width: 56.98px; height: 70px; left: 606px; top: 25px;" src="../../../assets/images/close.png" />
        </div>
    `;
}
