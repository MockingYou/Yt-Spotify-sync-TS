import { useState, Fragment } from "react";
import Cookies from "js-cookie";
import SelectorButton from "../components/SelectorButton";
// import SpotifyPlaylists from "../components/SpotifyData/SpotifyPlaylists";
import { faSpotify, faYoutube } from "@fortawesome/free-brands-svg-icons";

const popupWidth = 600;
const popupHeight = 900;
const left = window.screenX + (window.outerWidth - popupWidth) / 2;
const top = window.screenY + (window.outerHeight - popupHeight) / 2;

const Selector = () => {
  const [spotifyLoggedIn, setSpotifyLoggedIn] = useState(false);
  const [youtubeLoggedIn, setYoutubeLoggedIn] = useState(false);
  const [youtubeMusicLoggedIn, setYoutubeMusicLoggedIn] = useState(false);
  const [isSource, setIsSource] = useState(false)
  

  const handleSpotifyLogin = async () => {
    try {
      const popup = window.open(
        "http://localhost:8000/spotify/login",
        "_blank",
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`,
      );
      const messageHandler = (event: any) => {
        if (event.data == "Success! You can now close the window.") {
          setSpotifyLoggedIn(true);
          popup?.close();
          window.removeEventListener("message", messageHandler);
        }
      };
      window.addEventListener("message", messageHandler);
    } catch (error) {
      console.error("Error during Spotify login:", error);
    }
  };

  const handleLogin = async (token: string, apiName: string, ) => {
    try {
      if (!Cookies.get(token)) {
        const popup = window.open(
          `http://localhost:8000/${apiName}/login`,
          "_blank",
          `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`,
        );
        const messageHandler = (event: any) => {
          const { data } = event;
          if (data.success) {
            popup?.close();
            window.removeEventListener("message", messageHandler);
            setYoutubeLoggedIn(true);
            Cookies.set(token, data.token, { expires: 1 / 24 });
          }
        };
        window.addEventListener("message", messageHandler);
      }
    } catch (error) {
      console.error(`Error during ${apiName} login:`, error);
    }
  };

  const handleYoutubeLogin = async () => {
    try {
      if (!Cookies.get("youtubeToken")) {
        const popup = window.open(
          "http://localhost:8000/google/login",
          "_blank",
          `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`,
        );
        const messageHandler = (event: any) => {
          const { data } = event;
          if (data.success) {
            popup?.close();
            window.removeEventListener("message", messageHandler);
            setYoutubeLoggedIn(true);
            Cookies.set("youtubeToken", data.token, { expires: 1 / 24 });
          }
        };
        window.addEventListener("message", messageHandler);
      }
    } catch (error) {
      console.error("Error during Spotify login:", error);
    }
  };

  const handleYoutubeMusicLogin = () => {};
  const buttonData = [
    {
      name: "Spotify",
      icon: faSpotify,
      handleLogin: handleSpotifyLogin,
      loggedIn: spotifyLoggedIn,
    },
    {
      name: "Youtube",
      icon: faYoutube,
      handleLogin: handleYoutubeLogin,
      loggedIn: youtubeLoggedIn,
    },
    {
      name: "Youtube Music",
      icon: faYoutube,
      handleLogin: handleYoutubeMusicLogin,
      loggedIn: youtubeMusicLoggedIn,
    },
  ];

  return (
    <Fragment>
      <div className="flex h-screen flex-col items-center justify-center bg-gray-900">
        <p className="text-center text-white">Select a {isSource ? "Destination" : "Source"}:</p>
        <div className="mt-10 flex flex-wrap items-center justify-center bg-gray-900">
          {buttonData.map((data) => (
            <SelectorButton
              key={data.name}
              name={data.name}
              icon={data.icon}
              handleLogin={data.handleLogin}
              loggedIn={data.loggedIn}
            />
          ))}
        </div>
      </div>
    </Fragment>
  );
};

export default Selector;
