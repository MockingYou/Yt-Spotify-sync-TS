import { useState } from "react";
import Cookies from "js-cookie";

const popupWidth: number = 600;
const popupHeight: number = 900;
const left: number = window.screenX + (window.outerWidth - popupWidth) / 2;
const top: number = window.screenY + (window.outerHeight - popupHeight) / 2;
const useLogin = (): [
  boolean,
  (token: string, providerUrl: string, providerName: string) => void,
] => {
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = async (
    token: string,
    providerUrl: string,
    providerName: string,
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
            setLoggedIn(true);
            Cookies.set(`${providerName}Token`, data.token, {
              expires: 1 / 24,
            });
          }
        };
        window.addEventListener("message", messageHandler);
      }
    } catch (error) {
      console.error(`Error during ${providerName} login:`, error);
    }
  };
  return [loggedIn, handleLogin];
};

export default useLogin;
