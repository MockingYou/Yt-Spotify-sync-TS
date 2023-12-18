import React, { useState, useEffect, Fragment } from "react";
import axios from "axios";
import LoadingBar from "../components/LoadingBar";
import LoadingRadial from "../components/LoadingRadial";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline"

export default function SpotifyPlaylists(props) {
	const [spotifyPlaylist, setSpotifyPlaylist] = useState([]);
	const [playlistSongsYoutube, setPlaylistSongsYoutube] = useState([]);
	const [playlistSongsSpotify, setPlaylistSongsSpotify] = useState([]);
	const [loadingItem, setLoadingItem] = useState(null);
	const [loadingProgress, setLoadingProgress] = useState(0);
	const [playlistLink, setPlaylistLink] = useState("");
	const [loading, setLoading] = useState(false);
	const [collapsedSongs, setCollapsedSongs] = useState(true);

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
		} catch (error) {
			console.error("Error fetching playlists:", error);
			// Handle the error, e.g., set an error state or display a message to the user
		}
	};

	const getPlaylistSongs = async (playlistId) => {
		setPlaylistSongsSpotify([])

		try {
			setLoading(true)
			setLoadingItem(playlistId);
			const playlistSongs = await axios.get(
				`http://localhost:8000/api/spotify/playlist-songs/${playlistId}`,
				);
				setPlaylistSongsSpotify(playlistSongs.data)
				console.log(playlistSongs.data);
				// setPlaylistSongsSpotify((prevSongs) => [...prevSongs, playlistSongs.data]);4
			} catch (error) {
				console.error("Error fetching playlists:", error);
				// Handle the error, e.g., set an error state or display a message to the user
			}finally {
				setLoading(false);
				setCollapsedSongs(true)
			// setLoadingItem(null);
		}
	};

	return (
		<Fragment>
			<div className="flex">
				<div className="flex flex-col">
					<button onClick={getPlaylists}>
						Get from your playlists
					</button>
					<div className="justify-center flex flex-1 max-h-60 overflow-y-auto z-100 mt-2">
						<ul className="list-disc">
							{spotifyPlaylist.map((item, index) => (
								<div>
									<li
										className="m-4 flex items-center"
										key={index}
									>
										<div className="flex items-center justify-between space-x-4 w-full">
											<span>
												{item.name} 
												{ loadingItem === item.id && loading && <LoadingRadial /> }
												{ loadingItem === item.id &&
												<ul className="list-disc ml-8">
													{ playlistSongsSpotify.map((item, index) => (
														<li
															className="m-4 flex items-center"
															key={index}
														>
															{ item && `-> ${item.artist} - ${item.track}`}
														</li>
													))}
												</ul>  }
											</span>
											{ (collapsedSongs) ? 
												<PlusIcon className="h-6 w-6 text-blue-500" onClick={() => getPlaylistSongs(item.id)}/> : 
												<MinusIcon className="h-6 w-6 text-blue-500"/>
											}
										</div>
									</li>
								</div>
							))}
						</ul>
					</div>
				</div>

				<p> ---- or ----</p>

				<div className="item-center justify-center flex-col flex-1">
					<input
						className="w-1/2 h-10"
						placeholder="Playlist link"
						type="text"
						value={playlistLink}
						onChange={(e) => setPlaylistLink(e.target.value)}
					></input>
					<button className="w-20" onClick={convertPlaylist}>
						<p>Convert Playlist</p>
					</button>
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
		</Fragment>
	);
}
