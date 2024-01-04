import React, { useState, useEffect, Fragment } from "react";
import LoadingRadial from "../Loading/LoadingRadial";
import RotationIcon from "../Icons/RotationIcon";
import { PlusIcon, MinusCircleIcon } from "@heroicons/react/24/outline";
import { PlusCircleIcon } from "@heroicons/react/24/solid";

import axios from "axios";
import SpotifyPlaylistSong from "./SpotifyPlaylistSong";

const SpotifyPlaylistItem = (props) => {
  const [playlistSongsSpotify, setPlaylistSongsSpotify] = useState([]);
  const [loading, setLoading] = useState(false);
  const [collapsedSongs, setCollapsedSongs] = useState(true);
  const [selected, setSelected] = useState(false);

  const getPlaylistSongs = async (playlistId) => {
    try {
      setLoading(true);
      const playlistSongs = await axios.get(
        `http://localhost:8000/api/youtube/playlist-songs/${playlistId}`,
      );
      setPlaylistSongsSpotify(playlistSongs.data);
    } catch (error) {
      console.error("Error fetching playlists:", error);
    } finally {
      setLoading(false);
      setCollapsedSongs(false);
    }
  };

  const handleCollapseExpand = () => {
    if (collapsedSongs && playlistSongsSpotify.length === 0) {
      getPlaylistSongs(props.id);
    } else {
      setCollapsedSongs(!collapsedSongs);
    }
  };
  
  return (
    <Fragment>
      <div className="m-2 w-full items-center justify-between">
        <div className="m-2 flex w-full shrink-0 items-center justify-between">
          <span className="flex items-center">
            {selected ? (
              <MinusCircleIcon
                className="mr-4 h-6 w-6 cursor-pointer text-purple-500"
                onClick={() => {
                  setSelected(false);
                  props.removePlaylist();
                }}
              />
            ) : (
              <PlusCircleIcon
                className="mr-4 h-6 w-6 cursor-pointer text-purple-500"
                onClick={() => {
                  setSelected(true);
                  props.selectPlaylist();
                }}
              />
            )}

            <img
              className="mr-4 h-14 w-16 rounded"
              src={props.image}
              alt="image description"
            />
            {props.name}
            {loading && <LoadingRadial />}
          </span>
          <RotationIcon
            handleClick={handleCollapseExpand}
            collapsedSongs={collapsedSongs}
          />
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
