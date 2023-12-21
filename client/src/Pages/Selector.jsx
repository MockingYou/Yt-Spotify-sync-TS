import React, { useState, useEffect, Fragment } from "react";

import SelectorButton from "../components/SelectorButton";
import SpotifyPlaylists from "../components/SpotifyData/SpotifyPlaylists";
import { faSpotify, faYoutube } from "@fortawesome/free-brands-svg-icons";

const Selector = () => {
	const [spotifyLoggedIn, setSpotifyLoggedIn] = useState(false);
	const [youtubeLoggedIn, setYoutubeLoggedIn] = useState(false);
	const [youtubeMusicLoggedIn, setYoutubeMusicLoggedIn] = useState(false);

	const popupWidth = 600;
	const popupHeight = 900;
	const left = window.screenX + (window.outerWidth - popupWidth) / 2;
	const top = window.screenY + (window.outerHeight - popupHeight) / 2;

	const handleSpotifyLogin = async () => {
		try {
			const popup = window.open(
				"http://localhost:8000/spotify/login",
				"_blank",
				`width=${popupWidth},height=${popupHeight},left=${left},top=${top}`,
			);
			const messageHandler = (event) => {
				if (event.data == "Success! You can now close the window.") {
					setSpotifyLoggedIn(true);
					popup.close();
					window.removeEventListener("message", messageHandler);
				}
			};
			window.addEventListener("message", messageHandler);
		} catch (error) {
			console.error("Error during Spotify login:", error);
		}
	};

	const handleYoutubeLogin = () => {
		try {
			const popup = window.open(
				"http://localhost:8000/google/login",
				"_blank",
				`width=${popupWidth},height=${popupHeight},left=${left},top=${top}`,
			);
			window.addEventListener("message", (event) => {
				if (event.data === "Success! You can now close the window.") {
					setYoutubeLoggedIn(true);
					// Close the popup
					popup.close();
				}
			});
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
			<div>
				<SpotifyPlaylists />
			</div>
			<div className="h-screen bg-gray-900 w-full flex justify-center items-center">
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
		</Fragment>
	);
};

export default Selector;
