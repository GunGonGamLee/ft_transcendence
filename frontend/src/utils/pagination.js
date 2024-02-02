import { click, onClick } from "./clickEvent.js";

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
