/**
 * @description useState 훅 구현
 * @param {array | number | string | boolean | Object}stateInput 상태
 * @param {object}component 전달된 컴포넌트
 * @param {string}render 렌더링 함수 명
 * @returns [getState, setState] 반환
 * @description 배열이 인자로 올 때 동작이 다르니 유의해서 사용하세요
 */

export default function useState(stateInput, component, render) {
  if (Array.isArray(stateInput)) {
    // 배열일 경우
    let state = [...stateInput];
    const getState = () => {
      return state;
    };
    const setState = (newState) => {
      state = [...newState];
      component[render](); // render 메서드 호출
    };
    return [getState, setState];
  } else if (typeof stateInput === "object") {
    // 객체일 경우 (단, null과 배열 제외)
    let state = { ...stateInput };
    const getState = () => {
      return state;
    };
    const setState = (newState) => {
      state = { ...newState };
      component[render](); // render 메서드 호출
    };
    return [getState, setState];
  } else {
    // 기본형(primitive) 데이터 타입일 경우
    let state = stateInput;
    const getState = () => {
      return state;
    };
    const setState = (newState) => {
      state = newState;
      component[render](); // render 메서드 호출
    };
    return [getState, setState];
  }
}
