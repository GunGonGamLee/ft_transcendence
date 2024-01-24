export default function TournamentHistories() {
  this.$container = document.getElementById("list");
  this.$pagination = document.getElementById("pagination");

  this.init = () => {
    this.$pagination.style.display = "block";
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
