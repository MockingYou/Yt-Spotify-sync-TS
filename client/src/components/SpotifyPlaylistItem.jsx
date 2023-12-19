import React, { useState, useEffect, Fragment } from "react";
import LoadingRadial from "../components/LoadingRadial";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import SpotifyPlaylistSong from "./SpotifyPlaylistSong";

const SpotifyPlaylistItem = (props) => {
	const [playlistSongsSpotify, setPlaylistSongsSpotify] = useState([]);
	const [loadingItem, setLoadingItem] = useState(null);
	const [loading, setLoading] = useState(false);
	const [collapsedSongs, setCollapsedSongs] = useState(true);

	const getPlaylistSongs = async (playlistId) => {
		try {
			setLoading(true);
			setLoadingItem(playlistId);
			const playlistSongs = await axios.get(
				`http://localhost:8000/api/spotify/playlist-songs/${playlistId}`,
			);
			setPlaylistSongsSpotify(playlistSongs.data);
		} catch (error) {
			console.error("Error fetching playlists:", error);
			// Handle the error, e.g., set an error state or display a message to the user
		} finally {
			setLoading(false);
			setCollapsedSongs(false);
			// setLoadingItem(null);
		}
	};
	return (
		<Fragment>
			<div className="flex items-center justify-between w-full m-2">
				<span>
					{props.name}
					{loading && <LoadingRadial />}
					{ !collapsedSongs && playlistSongsSpotify.map((item, index) => (
						<SpotifyPlaylistSong
							artist={item.artist}
							track={item.track}
							key={index}
						/>
					))}
				</span>
				{collapsedSongs ? (
					<PlusIcon
						className="h-6 w-6 text-blue-500 mr-4"
						onClick={ () =>  
                            // playlistSongsSpotify ? setCollapsedSongs(false) : 
                            getPlaylistSongs(props.id)
                        }
					/>
				) : (
					<MinusIcon
						className="h-6 w-6 text-blue-500 mr-4"
						onClick={() => setCollapsedSongs(true)}
					/>
				)}
			</div>
		</Fragment>
	);
};

export default SpotifyPlaylistItem;
