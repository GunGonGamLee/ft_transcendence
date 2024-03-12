export const click = (element, func) => {
  element.addEventListener("click", func);
};

export const clickOnce = (element, func) => {
  element.addEventListener("click", func, { once: true });
};

export const onClick = (element, func) => {
  element.onclick = func;
};
