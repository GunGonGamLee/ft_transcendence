import App from "./src/app.js";
// import Header from "./src/header.js";

window.addEventListener("DOMContentLoaded", () => {
  // new Header($("#header"));
  new App(document.querySelector("#app"));
});
