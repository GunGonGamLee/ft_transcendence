export default function TournamentHistories() {
  this.$container = document.getElementById("list");

  this.init = () => {
  }

  this.setState = () => {
    this.render();
  }

  this.render = () => {
    this.init();
    this.$container.innerText = "토너먼트";
  }

  this.render();
}
