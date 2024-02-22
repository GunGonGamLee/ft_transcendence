/**
 *
 * @param {img, nickname, rating, status} props
 */
export default function userUnit(props) {
  // 빈 유저 칸
  if (props === null) {
    return `
    <div class="user-unit-wrapper" style="width: 20vw; height: 65vh; display: flex; flex-direction: column; justify-content: center; align-items: center">   
      <img alt="user" src="../../../assets/images/people.png" style="width: 10vw; height: 10vw; -webkit-user-drag: none; user-select: none; margin-bottom: 3vh">
      <span style="font-family: Galmuri11-Bold,serif; color: white; font-size: 3vh">???</span>
    </div>`;
  }
  let { img, nickname, rating, status, color } = props;
  return `
        <div class="user-unit-wrapper" style="width: 20vw; height: 65vh; display: flex; flex-direction: column; justify-content: center; align-items: center">
          <img class="user-image" alt="user" src="${img}" style="width: 10vw; height: 10vw; -webkit-user-drag: none; user-select: none;">
          <div class="user-nickname" style="margin-top: 2vh; font-family: Galmuri11-Bold,serif; color: white; font-size: 2.5vh">${nickname}</div>
          <div class="user-rating" style="margin-top: 1.5vh; font-family: Galmuri11-Bold,serif; color: white; font-size: 2.5vh">Rating: ${rating}</div>
          <div style="height: 0.3vh; width: 60%; background-color: ${color}; margin-top: 2vh;"></div>
          <div class="user-status" style="margin-top: 1.5vh; font-family: Galmuri11-Bold,serif; color: ${color}; font-size: 2.5vh">${status}</div>
        </div>
    `;
}
