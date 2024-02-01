/**
 * @description useState 훅 구현
 * @param state 상태
 * @param component 전달된 컴포넌트
 * @returns [getState, setState] 반환
 * @example 앞으로 모든 컴포넌트 렌더링 함수 다 render로 통일 해야 합니다. 안그러면 최신화가 안됩니다.
 */
export default function useState(state, component) {
  const getState = () => {
    return state;
  };
  const setState = (newState) => {
    state = newState;
    component.render(); // 그냥 render를 인자로 받으면 최신화가 안되버리는..!
  };
  return [getState, setState];
}
