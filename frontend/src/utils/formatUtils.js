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

/**
 * 시간을 포맷팅하여 반환합니다. (HH:mm:ss)
 * @param timeString {string} 시간 문자열
 * @returns {string} 포맷팅된 시간 문자열
 */
export function formatTime(timeString) {
  const [hour, minute, second] = timeString.split(":");
  return (
    hour.split(".")[0] + ":" + minute.split(".")[0] + ":" + second.split(".")[0]
  );
}

/**
 * 승률을 포맷팅하여 반환합니다. (xx.xx%)
 * @param rate {number} 승률 문자열
 * @returns {string} 포맷팅된 승률 문자열
 */
export function formatWinRate(rate) {
  return rate.toFixed(2) + "%";
}
