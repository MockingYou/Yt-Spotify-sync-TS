import React, { useState, useEffect, Fragment } from "react";
import axios from "axios";
import LoadingBar from "../components/LoadingBar";
import SelectorButton from "../components/SelectorButton";
import { faSpotify, faYoutube } from "@fortawesome/free-brands-svg-icons";

const Selector = () => {
	const [spotifyLoggedIn, setSpotifyLoggedIn] = useState(false);
	const [youtubeLoggedIn, setYoutubeLoggedIn] = useState(false);
	const [youtubeMusicLoggedIn, setYoutubeMusicLoggedIn] = useState(false);

	const [loadingProgress, setLoadingProgress] = useState(0);
	const [playlistLink, setPlaylistLink] = useState("");

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
			const messageHandler = event => {
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
			window.addEventListener("message", event => {
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

	const convertPlaylist = async () => {
		try {
			const playlistId = playlistLink.split("=")[1];
			console.log(playlistId);
			const response = await axios.post(
				`http://localhost:8000/api/spotify/add-songs/${playlistId}`,
			);
			setLoadingProgress(prevProgress =>
				prevProgress < 100 ? prevProgress + 10 : prevProgress,
			);
			console.log(response.data);
		} catch (error) {
			console.error("Error getting Playlist:", error.message);
		}
		if (loadingProgress != 100) {
			setLoadingProgress(100);
		}
	};
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
			<input
				placeholder="Playlist link"
				type="text"
				value={playlistLink}
				onChange={e => setPlaylistLink(e.target.value)}
			></input>
			<button className="w-20" onClick={convertPlaylist}>
				<p>Convert Playlist</p>
			</button>
			<LoadingBar progress={loadingProgress} />
			<div className="h-screen bg-gray-900 w-full flex justify-center items-center">
				{buttonData.map(data => (
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
