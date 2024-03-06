import deepCopy from "./deepCopy.js";
/**
 * useReducer
 * @param {function} reducer
 * @param {Array | Object | number | string | boolean} stateInput
 * @param {HTMLElement} component
 * @param {string} render
 * @returns
 */
export default function useReducer(reducer, stateInput, component, render) {
  let state = stateInput;
  const getState = () => {
    return state;
  };
  const dispatch = (action) => {
    let newState = deepCopy(state);
    reducer(newState, action);
    state = newState;
    component[render]();
  };
  return [getState, dispatch];
}
