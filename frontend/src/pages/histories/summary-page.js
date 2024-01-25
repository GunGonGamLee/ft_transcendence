export default function Summary() {
  this.$container = document.getElementById("list");
  this.$pagination = document.getElementById("pagination");

  this.init = () => {
    this.$pagination.style.display = "none";
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
