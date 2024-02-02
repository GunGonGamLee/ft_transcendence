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
 * 이전, 다음 페이지로 이동하는 버튼에 대한 onClick 프로퍼티를 추가합니다.
 * @param prevId {string} 이전 페이지로 이동하는 버튼의 id
 * @param nextId {string} 다음 페이지로 이동하는 버튼의 id
 * @param prevFunction {function} 이전 페이지 클릭 시 동작하는 함수
 * @param nextFunction {function} 다음 페이지 클릭 시 동작하는 함수
 */
export const addPaginationOnClickProperty = (
  prevId,
  nextId,
  prevFunction,
  nextFunction,
) => {
  let $prev = document.getElementById(prevId);
  let $next = document.getElementById(nextId);
  onClick($prev, prevFunction);
  onClick($next, nextFunction);
};
