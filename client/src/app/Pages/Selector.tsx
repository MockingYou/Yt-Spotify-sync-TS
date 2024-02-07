import { useState, Fragment } from "react";
import handleLogin from "../HelperFunctions/authMiddleware";
import SelectorButton from "../components/SelectorButton";
import { faSpotify, faYoutube } from "@fortawesome/free-brands-svg-icons";

const Selector = () => {
  const [spotifyLoggedIn, setSpotifyLoggedIn] = useState(false);
  const [youtubeLoggedIn, setYoutubeLoggedIn] = useState(false);
  const [youtubeMusicLoggedIn, setYoutubeMusicLoggedIn] = useState(false);
  const [isSource, setIsSource] = useState(false);

  const handleCombinedLogin = (token: string, providerUrl: string, providerName: string, setLoggedInState: Function) => {
    handleLogin(token, providerUrl, providerName, setLoggedInState);
  };

  const buttonData = [
    {
      name: "Spotify",
      icon: faSpotify,
      handleLogin: () => handleCombinedLogin("spotifyToken", "http://localhost:8000/spotify/login", "spotify", setSpotifyLoggedIn),
      loggedIn: spotifyLoggedIn,
    },
    {
      name: "Youtube",
      icon: faYoutube,
      handleLogin: () => handleCombinedLogin("youtubeToken", "http://localhost:8000/google/login", "youtube", setYoutubeLoggedIn),
      loggedIn: youtubeLoggedIn,
    },
    {
      name: "Youtube Music",
      icon: faYoutube,
      handleLogin: "",
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
