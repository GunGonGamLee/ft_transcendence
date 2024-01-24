/**
 * @discription 마우스 hover 시 폰트 색상 변경
 * @param elements {HTMLElement[]} hover 효과를 넣고 싶은 html 엘리먼트들
 * @param originalColor {string} 원래 색상
 * @param hoverColor {string} hover 시 색상
 */
export const hoverChangeColor = (elements, originalColor, hoverColor) => {
  for (let element of elements) {
    element.addEventListener("mouseover", () => {
      element.style.color = hoverColor;
    });
    element.addEventListener("mouseout", () => {
      element.style.color = originalColor;
    });
  }
}

/**
 * 마우스 hover 시 폰트 변경
 * @param elements {HTMLElement[]} hover 효과를 넣고 싶은 html 엘리먼트들
 * @param originalFont {string} 원래 font-family
 * @param hoverFont {string} hover 시 font-family
 */
export const hoverChangeFont = (elements, originalFont, hoverFont) => {
  for (let element of elements) {
    element.addEventListener("mouseover", () => {
      element.style.fontFamily = hoverFont;
    });
    element.addEventListener("mouseout", () => {
      element.style.fontFamily = originalFont;
    });
  }
}

/**
 * 마우스 hover 시 border 변경
 * @param elements {HTMLElement[]} hover 효과를 넣고 싶은 html 엘리먼트들
 * @param originalBorder {string} 원래 border
 * @param hoverBorder {string} hover 시 border
 */
export const hoverChangeBorder = (elements, originalBorder, hoverBorder) => {
  for (let element of elements) {
    element.addEventListener("mouseover", () => {
      element.style.border = hoverBorder;
    });
    element.addEventListener("mouseout", () => {
      element.style.border = originalBorder;
    });
  }
}

/**
 * 마우스 hover 시 cursor 변경
 * @param elements {HTMLElement[]} hover 효과를 넣고 싶은 html 엘리먼트들
 * @param cursor {string} hover 시 cursor
 */
export const hoverChangeCursor = (elements, cursor) => {
  for (let element of elements) {
    element.addEventListener("mouseover", () => {
      element.style.cursor = cursor;
    });
    element.addEventListener("mouseout", () => {
      element.style.cursor = "default";
    });
  }
}

/**
 * toggleSwitch를 hover하면 toggleItem을 보여주고, toggleSwitch를 벗어나면 toggleItem을 숨깁니다.
 * @param toggleSwitch hover 효과를 넣고 싶은 html 엘리먼트
 * @param toggleItem toggleSwitch를 hover하면 보여줄 html 엘리먼트
 * @param displayAttr toggleItem을 보여줄 때 사용할 display 속성
 */
export const hoverToggle = (toggleSwitch, toggleItem, displayAttr) => {
  toggleSwitch.addEventListener("mouseover", () => {
    toggleItem.style.display = displayAttr;
  });
  toggleSwitch.addEventListener("mouseout", () => {
    toggleItem.style.display = "none";
  });
}
