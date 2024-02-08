/**
 * name에 해당하는 쿠키를 가져오는 함수
 * @param name {string} 쿠키 이름
 * @returns {string | null} 쿠키가 있을 경우 그 값을, 쿠키가 없을 경우 null 반환
 */
export function getCookie(name) {
  const cookies = document.cookie.split(";");
  cookies.filter((cookie) => {
    const [key, value] = cookie.split("=");
    if (key.trim() === name) {
      return value;
    }
  });
  return null;
}
