import { click, onClick } from "./clickEvent.js";

/**
 * 이전, 다음 페이지로 이동하는 버튼에 대한 이벤트 리스너를 추가합니다.
 * @param prevId {string} 이전 페이지로 이동하는 버튼의 id
 * @param nextId {string} 다음 페이지로 이동하는 버튼의 id
 * @param prevFunction {function} 이전 페이지 클릭 시 동작하는 함수
 * @param nextFunction {function} 다음 페이지 클릭 시 동작하는 함수
 */
export const addPaginationClickListeners = (
  prevId,
  nextId,
  prevFunction,
  nextFunction,
) => {
  let $prev = document.getElementById(prevId);
  let $next = document.getElementById(nextId);
  click($prev, prevFunction);
  click($next, nextFunction);
};

/**
 * 페이지로 이동하는 버튼에 대한 onClick 프로퍼티를 추가합니다.
 * @param paginationIdOrElement {string | HTMLElement} 페이지네이션의 id 또는 HTMLElement
 * @param paginationFunction {function} 페이지네이션 클릭 시 동작하는 함수
 */
export const addPaginationOnClickProperty = (
  paginationIdOrElement,
  paginationFunction,
) => {
  if (typeof paginationIdOrElement === "string") {
    let $pagination = document.getElementById(paginationIdOrElement);
    onClick($pagination, paginationFunction);
  }
  if (paginationIdOrElement instanceof HTMLElement) {
    onClick(paginationIdOrElement, paginationFunction);
  }
};

/**
 * 페이지로 이동하는 버튼에 대한 onClick 프로퍼티를 제거합니다.
 * @param paginationIdOrElement {string | HTMLElement} 페이지네이션의 id 또는 HTMLElement
 */
export const removePaginationOnClickProperty = (paginationIdOrElement) => {
  if (typeof paginationIdOrElement === "string") {
    let $pagination = document.getElementById(paginationIdOrElement);
    $pagination.removeAttribute("onclick");
  }
  if (paginationIdOrElement instanceof HTMLElement) {
    paginationIdOrElement.removeAttribute("onclick");
  }
};

/**
 * 이전, 다음 페이지로 이동하는 버튼의 활성화 여부를 설정합니다.
 * @param $pagination {HTMLElement} 페이지네이션 버튼
 * @param isActive {boolean} 활성화 여부
 * @param activeFunction {function | null} 활성화 시 동작하는 함수. isActive가 false일 때는 null
 */
export const setPaginationActive = ($pagination, isActive, activeFunction) => {
  if (isActive) {
    $pagination.style.opacity = "1";
    $pagination.style.cursor = "pointer";
    addPaginationOnClickProperty($pagination, activeFunction);
  } else {
    $pagination.style.opacity = "0.5";
    $pagination.style.cursor = "default";
    removePaginationOnClickProperty($pagination);
  }
};

/**
 * 페이지네이션을 초기화합니다.
 * @param $pagination {HTMLElement} 페이지네이션 버튼을 감싸는 <div> 엘리먼트
 * @param $prev {HTMLElement} 이전 페이지로 이동하는 버튼
 * @param $next {HTMLElement} 다음 페이지로 이동하는 버튼
 */
export const initializePagination = ($pagination, $prev, $next) => {
  this.$pagination.style.display = "block";
  this.$prev.dataset.page = "0";
  this.$next.dataset.page = "0";
  setPaginationActive(this.$prev, false, null);
  setPaginationActive(this.$next, false, null);
};
