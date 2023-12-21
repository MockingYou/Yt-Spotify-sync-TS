import React, { useState, useEffect, Fragment } from "react";
import LoadingRadial from "../Loading/LoadingRadial";
import RotationIcon from "../Icons/RotationIcon"
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import { MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/24/solid";

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
      <div className="m-2 w-full items-center justify-between">
        <div className="m-2 flex w-full shrink-0 items-center justify-between">
          <span className="flex items-center">
          <PlusCircleIcon className="mr-4 h-6 w-6 text-purple-500" />

            <img
              className="mr-4 h-14 w-16 rounded"
              src={props.image}
              alt="image description"
            />
            {props.name}
            {loading && <LoadingRadial />}
          </span>
          {collapsedSongs ? (
        <RotationIcon handleClick={getPlaylistSongs(props.id) } />
           

            // <PlusIcon
            //   className="mr-6 h-6 w-6 text-yellow-500"
            //   onClick={() =>
            //     // playlistSongsSpotify ? setCollapsedSongs(false) :
            //     getPlaylistSongs(props.id)
            //   }
            // />
          ) : (
            <MinusIcon
              className="mr-6 h-6 w-6 text-purple-500"
              onClick={() => setCollapsedSongs(true)}
            />
          )}
        </div>
        <div className="m-2 flex max-w-fit flex-col pl-4">
          {!collapsedSongs &&
            playlistSongsSpotify.map((item, index) => (
              <SpotifyPlaylistSong
                artist={item.artist}
                track={item.track}
                key={index}
              />
            ))}
        </div>
      </div>
    </Fragment>
  );
};

export default SpotifyPlaylistItem;
