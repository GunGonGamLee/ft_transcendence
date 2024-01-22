export default function Ranking() {
  this.$container = document.getElementById("list");

  this.init = () => {
  }

  this.setState = () => {
    this.render();
  }

  this.render = () => {
    this.init();
    this.$container.innerText = "랭킹";
  }

  this.render();
}
