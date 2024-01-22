export default function Summary() {
  this.$container = document.getElementById("list");

  this.init = () => {
  }

  this.setState = () => {
    this.render();
  }

  this.render = () => {
    this.init();
    this.$container.innerText = "개요";
  }

  this.render();
}
