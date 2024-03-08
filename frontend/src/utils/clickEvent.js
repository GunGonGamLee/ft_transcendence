// TODO => click 시의 동작은 여기서 정의
export const click = (element, func) => {
  element.addEventListener("click", func);
};

export const clickOnce = (element, func) => {
  element.addEventListener("click", func, { once: true });
};

export const onClick = (element, func) => {
  element.onclick = func;
};
