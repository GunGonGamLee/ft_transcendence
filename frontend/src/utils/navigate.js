/**
 * @param  { string } to
 * @param  { number | boolean } errorCode
 */
export const navigate = (to, errorCode= false) => {
  const historyChangeEvent = new CustomEvent("historychange", {
    detail: {
      to,
      errorCode
    },
  });

  dispatchEvent(historyChangeEvent); // historychange 이벤트를 발생시킵니다.
};
