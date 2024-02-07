// authMiddleware.js

import Cookies from "js-cookie";

const popupWidth = 600;
const popupHeight = 900;
const left = window.screenX + (window.outerWidth - popupWidth) / 2;
const top = window.screenY + (window.outerHeight - popupHeight) / 2;

const handleLogin = async (
  token: string,
  providerUrl: string,
  providerName: string,
  setLoggedInState: Function,
) => {
  try {
    if (!Cookies.get(token)) {
      const popup = window.open(
        providerUrl,
        "_blank",
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`,
      );
      const messageHandler = (event: any) => {
        const { data } = event;
        if (data.success) {
          popup?.close();
          window.removeEventListener("message", messageHandler);
          setLoggedInState(true);
          Cookies.set(`${providerName}Token`, data.token, { expires: 1 / 24 });
        }
      };
      window.addEventListener("message", messageHandler);
    }
  } catch (error) {
    console.error(`Error during ${providerName} login:`, error);
  }
};

export default handleLogin;
