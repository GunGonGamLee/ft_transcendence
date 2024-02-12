const devBackend = "http://localhost:8000/api";
const prodBackend = "https://localhost/api";

const getAPIUrl = async () => {
  if (window.mode === "dev") {
    return devBackend;
  } else {
    return prodBackend;
  }
};

export const BACKEND = await getAPIUrl();
