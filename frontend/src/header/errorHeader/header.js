/**
 * 사용자 전적 페이지에 사용하는 header 컴포넌트
 * @param {HTMLElement} $container
 */
export default function ErrorHeader($container) {
  this.$container = $container;

  this.setState = () => {
    this.render();
  }

  this.render = () => {
    this.$container.innerHTML = `
    <div style="width: 100vw; height: 12vh; background: #0000AA"></div>
    `
  }

  this.render();
}