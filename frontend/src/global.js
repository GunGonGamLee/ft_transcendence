const devBackend = "http://localhost:8000/api";
const prodBackend = "https://localhost/api";

const getAPIUrl = () => {
  if (window.mode === "dev") {
    return devBackend;
  } else {
    return prodBackend;
  }
};

export const BACKEND = getAPIUrl();
export const HISTORIES_IMAGE_PATH = "../../../assets/images";
