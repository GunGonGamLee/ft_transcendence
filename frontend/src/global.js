const devBackend = "http://localhost:8000/api";
const devWebSocket = "ws://localhost:8000/ws"
const prodBackend = "https://localhost:443/api";
const prodWebSocket = "wss://localhost:443/ws";

const getAPIUrl = () => {
  if (window.mode === "dev") {
    return devBackend;
  } else {
    return prodBackend;
  }
};

export const BACKEND = getAPIUrl();
export const HISTORIES_IMAGE_PATH = "../../../assets/images";

export const MODE = {
  casual: "캐주얼 모드",
  tournament: "토너먼트 모드",
  one_on_one: "1 vs 1 모드",
};
