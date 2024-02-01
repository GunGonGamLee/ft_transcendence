/**
 * @description useState 훅 구현
 * @param {array | number | string}stateInput 상태
 * @param {object}component 전달된 컴포넌트
 * @param {string}render 렌더링 함수 명
 * @returns [getState, setState] 반환
 * @description 배열이 인자로 올 때 동작이 다르니 유의해서 사용하세요
 */
export default function useState(stateInput, component, render) {
  if (typeof stateInput === "object") {
    let state = [...stateInput];
    const getState = () => {
      return state;
    };
    const setState = (newState) => {
      state = [...newState];
      component[render](); // 그냥 render를 인자로 받으면 최신화가 안되버리는..!
    };
    return [getState, setState];
  } else if (typeof stateInput === "number" || typeof stateInput === "string") {
      let state = stateInput;
      const getState = () => {
        return state;
      };
      const setState = (newState) => {
        state = newState;
        component[render](); // 그냥 render를 인자로 받으면 최신화가 안되버리는..!
      };
      return [getState, setState];
  }
}

