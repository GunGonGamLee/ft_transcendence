/**
 * 사용자 전적 페이지에 사용하는 header 컴포넌트
 * @param {HTMLElement} $container
 */
export default function nicknameHeader($container) {
  this.$container = $container;

  this.setState = () => {
    this.render();
  }

  this.render = () => {
    this.$container.innerHTML = `
        <div class="nickname header-wrapper" style="width: 100vw; height: 12vh; background: #191D40">
        `
  }

  this.render();
}