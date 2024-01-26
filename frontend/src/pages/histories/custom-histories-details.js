export default async function CustomHistoriesDetails(id) {

  this.init = () => {
    this.$container = document.getElementById("list");
    this.id = id;
    this.$container.textContent = "";
  }

  this.useState = async () => {
    // TODO => backend로부터 데이터 받아오기
    this.state = {
      id,
      mode: "1vs1",
      player1: {
        nickname: "hyojocho",
        avatar: "../../../assets/images/avatar/blue.png",
        rating: 2130,
        score: 4,
        is_winner: true,
      }, player2: {
        nickname: "yena",
        avatar: "../../../assets/images/avatar/green.png",
        rating: 110,
        score: 1,
        is_winner: false,
      },
      date: "2024.01.26 13:53",
      playtime: "00:05:23",
    };
  }

  this.setState = () => {

  }

  this.render = () => {

  }

  this.init();
  await this.useState();
  this.setState();
  this.render();
}
