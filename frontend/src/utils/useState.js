/**
 * @description useState 훅 구현
 * @param state 상태
 * @param {object}component 전달된 컴포넌트
 * @param {string}render 렌더링 함수 명
 * @returns [getState, setState] 반환
 */
export default function useState(state, component, render) {
  const getState = () => {
    return state;
  };
  const setState = (newState) => {
    state = newState;
    component[render](); // 그냥 render를 인자로 받으면 최신화가 안되버리는..!
  };
  return [getState, setState];
}
