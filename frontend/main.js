import App from "./src/app.js";
import Header from "./src/header/header.js";
import { $ } from "./src/utils/querySelector.js";

window.addEventListener("DOMContentLoaded", (e) => {
  new Header($("#header"));
  new App($("#app"));
});
