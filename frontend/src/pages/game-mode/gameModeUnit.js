/**
 * @description 게임 모드 선택 페이지에서 사용되는 유닛 컴포넌트
 * @param {number} unitNumber 유닛 번호
 */
export default function GameModeUnit(unitNumber) {
    const data = [
        {img: "../../../assets/images/1vs1_logo.png", title: "2P 모드", description1: "한 컴퓨터에서 두 명의", description2: "사용자가 경기를 치른다."},
        {img: "../../../assets/images/tournament_logo.png", title: "토너먼트 모드", description1: "랜덤으로 4명의 사용자와", description2: "토너먼트 경기를 치른다."},
        {img: "../../../assets/images/setting.png", title: "사용자 지정 모드", description1: "다양한 모드로", description2: "게임을 즐길 수 있다."}
    ];
    return (`
        <div class="box" style="height: 65vh; width: 25vw; display: flex; flex-direction: column; justify-content: center; align-items: center">
          <img src="${data[unitNumber].img}" style="width: 17vw; height: 25vh">
          <div style="font-size: 2vw; color: white; margin-top: 4vh; font-family: Galmuri11, serif">${data[unitNumber].title}</div>
          <div style="font-size: 1.5vw; color: white; margin-top: 2vh; font-family: Galmuri11, serif;">${data[unitNumber].description1}</div>
          <div style="font-size: 1.5vw; color: white; margin-top: 1vh; font-family: Galmuri11, serif;">${data[unitNumber].description2}</div>
        </div>
    `)
}
