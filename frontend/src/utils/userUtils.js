import { BACKEND } from "../global.js";
import { getCookie } from "./cookie.js";

/**
 * 사용자의 정보를 가져옵니다.
 * @returns {Promise<{status: number, data: object | string}>} 사용자의 정보
 */
export const getUserMe = () => {
  return new Promise((resolve, reject) => {
    fetch(`${BACKEND}/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("jwt")}`,
      },
    }).then((response) => {
      if (response.status === 200) {
        response.json().then((data) => {
          resolve({ status: response.status, data });
        });
      } else {
        reject({ status: response.status, data: response.statusText });
      }
    });
  });
};
