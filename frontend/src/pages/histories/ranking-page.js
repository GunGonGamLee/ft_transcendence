export default function Ranking() {
  this.$container = document.getElementById('list');
  this.$pagination = document.getElementById('pagination');

  this.init = () => {
    this.$pagination.style.display = 'none';
  };

  this.setState = () => {
    this.render();
  };

  this.render = () => {
    this.$container.innerText = '랭킹';
  };

  this.render();
}
