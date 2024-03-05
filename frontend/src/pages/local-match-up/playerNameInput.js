export default function PlayerNameInput(playerNum) {
  return `
    <div style="display: flex; margin-bottom: 4vh">
      <div style="display: flex; align-items: center">
        <span style="display: inline-block; font-family: Galmuri11-Bold, serif; color: yellow; font-size: x-large; margin-right: 2vw">${playerNum}P</span>
      </div>
      <input class="player-name-input-${playerNum}" type="text" class="form-control" placeholder="닉네임을 입력하세요" style="width: 20vw; height: 5vh; font-size: 2vh; font-family: Galmuri11, serif; text-align: center">
    </div>
  `;
}
