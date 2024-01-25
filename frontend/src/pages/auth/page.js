import { navigate } from '../../utils/navigate.js';
/**
 * @param {HTMLElement} $container
 */
export default function Auth($container) {
  this.$container = $container;

  this.setState = () => {
    // URL에서 JWT 토큰 파싱
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('jwt'); // 'jwt'는 URL 파라미터의 키 이름

    // 토큰을 세션 스토리지에 저장
    if (token) {
      localStorage.setItem('jwtToken', token);
    }
    navigate('/register');
  };

  this.setState();
}
