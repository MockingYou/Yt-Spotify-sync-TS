import React, { useState, useEffect, Fragment } from "react";
import axios from "axios";
import LoadingBar from "../components/LoadingBar";
import Button from "../components/Button"
import SpotifyPlaylistItem from "../components/SpotifyPlaylistItem"

export default function SpotifyPlaylists(props) {
	const [spotifyPlaylist, setSpotifyPlaylist] = useState([]);
	const [playlistSongsYoutube, setPlaylistSongsYoutube] = useState([]);

	const [loadingProgress, setLoadingProgress] = useState(0);
	const [playlistLink, setPlaylistLink] = useState("");

	const clampToRange = (value, min, max) => {
		const clampValue = Math.max(min, Math.min(value, max));
		const mappedValue = ((clampValue - min) / max - min) * 100;
		return mappedValue;
	};

	const convertPlaylist = async () => {
		setPlaylistSongsYoutube([]);
		const playlistId = playlistLink.split("=")[1];
		const playlistLength = await axios(
			`http://localhost:8000/api/youtube/get-length/${playlistId}`,
		);
		console.log(playlistLength.data);
		let i = 0;
		// (playlistLength.data + i) / 100
		const eventSource = new EventSource(
			`http://localhost:8000/api/spotify/add-songs/${playlistId}`,
		);
		if (typeof EventSource !== "undefined") {
			console.log("macarena");
		} else {
			console.log("cacat");
		}
		eventSource.onmessage = (event) => {
			const eventData = JSON.parse(event.data);
			setPlaylistSongsYoutube((prevSongs) => [
				...prevSongs,
				eventData.message,
			]);
			i++;
			let progress = clampToRange(i, 0, playlistLength.data).toFixed(2);
			setLoadingProgress(progress);
		};
		return () => {
			eventSource.close();
		};
	};

	const getPlaylists = async () => {
		try {
			const playlistData = await axios.get(
				"http://localhost:8000/api/spotify/playlist",
			);
			setSpotifyPlaylist(playlistData.data);
			console.log(playlistData.data)
		} catch (error) {
			console.error("Error fetching playlists:", error);
			// Handle the error, e.g., set an error state or display a message to the user
		}
	};



	return (
		<Fragment>
			<div className="flex bg-gray-900 border border-grey-200 rounded-lg">
				<div className="flex flex-col w-[46rem] mt-2 rounded-3xl bg-gray-800 px-3 py-2 text-sm font-semibold text-white shadow-sm p-5 m-5 h-[46rem]">
					<Button method={getPlaylists}
						name="Get from your playlists"
					/>
					<div className="justify-center flex flex-col max-h-[46rem] max-w-2xl overflow-y-auto z-100 ">
						{ spotifyPlaylist.map((item, index) => (
							<SpotifyPlaylistItem name={item.name} id={item.id} key={index}/>
						))}
					</div>
				</div>

				<p> ---- or ----</p>
				
				<div className="w-[46rem] mt-2 rounded-3xl bg-gray-800 px-3 py-2 text-sm font-semibold text-white shadow-sm  p-5 m-5 h-48">
					<div className="item-center justify-center flex-col flex-1 ">
						<input
							className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
							placeholder="Playlist link"
							type="text"
							value={playlistLink}
							onChange={(e) => setPlaylistLink(e.target.value)}
						></input>
						<Button className="right-0.5" method={convertPlaylist} name="Convert Playlist"/>
					</div>
					<LoadingBar progress={loadingProgress} />
					<div className="justify-center flex flex-1 max-h-40 overflow-y-auto z-100">
						<ul className="list-disc">
							{playlistSongsYoutube.map((item, index) => (
								<li className="m-4" key={index}>
									{item}
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</Fragment>
	);
}
