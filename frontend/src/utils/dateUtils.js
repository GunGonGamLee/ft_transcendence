/**
 * 날짜를 포맷팅하여 반환합니다. (yyyy-MM-dd HH:mm:ss)
 * @param dateString
 * @returns {string}
 */
export function formatDateWithTime(dateString) {
  const TIME_ZONE = 9 * 60 * 60 * 1000; // 9시간
  const date = new Date(dateString);

  const formattedDate = new Date(date.getTime() + TIME_ZONE)
    .toISOString()
    .split("T")[0];
  const formattedTime = date.toTimeString().split(" ")[0];
  return formattedDate + " " + formattedTime;
}
