const devBackend = "http://localhost:8000/api";
const devWebSocket = "ws://localhost:8000/ws";
const prodBackend = "https://10.14.5.2:443/api";
const prodWebSocket = "wss://10.14.5.2:443/ws";

const getAPIUrl = () => {
  return window.mode === "dev" ? devBackend : prodBackend;
};

const getWebsocketUrl = () => {
  return window.mode === "dev" ? devWebSocket : prodWebSocket;
};

export const BACKEND = getAPIUrl();
export const WEBSOCKET = getWebsocketUrl();
export const HISTORIES_IMAGE_PATH = "../../../assets/images";
export const AVATAR_FILE_NAME = [
  "chewbacca.png",
  "darth_vader.png",
  "han_solo.png",
  "luke_skywalker.png",
  "yoda.png",
];

export const MODE = {
  casual: "캐주얼 모드",
  casual_tournament: "토너먼트 모드",
  rank: "랭크 토너먼트",
  one_on_one: "1 vs 1 모드",
};
