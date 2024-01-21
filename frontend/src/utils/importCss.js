/**
 * @description Import css file
 * @param {string} path
 */
export const importCss = (path) => {
  if (document.getElementsByTagName("head") !== null) {
    document.getElementsByTagName("head")[0].insertAdjacentHTML(
      "beforeend",
      `<link rel="stylesheet" href="${path}"/>`
    );
  }
}