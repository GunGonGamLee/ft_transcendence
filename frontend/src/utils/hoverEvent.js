/**
 * 마우스 hover 시 폰트 색상 변경
 * @param element hover 효과를 넣고 싶은 html 엘리먼트
 * @param originalColor 원래 색상
 * @param hoverColor hover 시 색상
 */
export const hoverChangeColor = (element, originalColor, hoverColor) => {
    element.addEventListener("mouseover", () => {
        element.style.color = hoverColor;
        element.style.cursor = "pointer";
    });
    element.addEventListener("mouseout", () => {
        element.style.color = originalColor;
    });
}

/**
 * 마우스 hover 시 폰트 변경
 * @param element hover 효과를 넣고 싶은 html 엘리먼트
 * @param originalFont 원래 폰트
 * @param hoverFont hover 시 폰트
 */
export const hoverChangeFont = (element, originalFont, hoverFont) => {
    element.addEventListener("mouseover", () => {
        element.style.fontFamily = hoverFont;
        element.style.cursor = "pointer";
    });
    element.addEventListener("mouseout", () => {
        element.style.fontFamily = originalFont;
    });
}

/**
 * 마우스 hover 시 border 변경
 * @param element hover 효과를 넣고 싶은 html 엘리먼트
 * @param originalBorder 원래 border
 * @param hoverBorder hover 시 border
 */
export const hoverChangeBorder = (element, originalBorder, hoverBorder) => {
    element.addEventListener("mouseover", () => {
        element.style.border = hoverBorder;
        element.style.cursor = "pointer";
    });
    element.addEventListener("mouseout", () => {
        element.style.border = originalBorder;
    });
}