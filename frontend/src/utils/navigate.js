/**
 * @param  { string } to
 * @param {Object} info
 */
export const navigate = (to, info = null) => {
  const historyChangeEvent = new CustomEvent("historychange", {
    detail: {
      to,
      info,
    },
  });

  dispatchEvent(historyChangeEvent); // historychange 이벤트를 발생시킵니다.
};
