import { Histories } from "../histories/page.js";

export default function Avatar() {
  new Histories(document.getElementById("app"));
  this.$pagination = document.getElementById("pagination");
  const init = () => {
    this.$pagination.style.display = "none";
  };

  init();
}
