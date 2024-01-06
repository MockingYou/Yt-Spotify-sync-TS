import React, { useState, useEffect, Fragment } from "react";
import { faSpotify, faYoutube } from "@fortawesome/free-brands-svg-icons";
import SelectorButton from "../components/SelectorButton";
import { handleLogin } from "../HelperFunctions/helperFunction"

const Selector = () => {
	const [spotifyLoggedIn, setSpotifyLoggedIn] = useState(false);
	const [youtubeLoggedIn, setYoutubeLoggedIn] = useState(false);
	const [youtubeMusicLoggedIn, setYoutubeMusicLoggedIn] = useState(false);

	const handleYoutubeMusicLogin = () => {};
	const buttonData = [
		{
		  name: "Spotify",
		  icon: faSpotify,
		  handleLogin: () => handleLogin("http://localhost:8000/spotify/login", setSpotifyLoggedIn), // Corrected
		  loggedIn: spotifyLoggedIn,
		},
		{
		  name: "Youtube",
		  icon: faYoutube,
		  handleLogin: () => handleLogin("http://localhost:8000/youtube/login", setYoutubeLoggedIn), // Corrected
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
		  <div className="h-screen bg-gray-900 w-full flex justify-center items-center">
			<p>Select a source: </p>
			{buttonData.map((data) => (
			  <SelectorButton
				key={data.name}
				name={data.name}
				icon={data.icon}
				handleLogin={data.handleLogin}
				loggedIn={data.loggedIn}
				to="/sourcecontrol"
			  />
			))}
		  </div>
		</Fragment>
	  );
	};

export default Selector;
