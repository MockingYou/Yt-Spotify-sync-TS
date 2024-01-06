import React, { useState, useEffect, Fragment } from "react";
import axios from "axios";
import LoadingBar from "../Loading/LoadingBar";
import Button from "../Button";
import SpotifyPlaylistItem from "./SpotifyPlaylistItem";
import { getPlaylist } from "../../HelperFunctions/helperFunction"

export default function SpotifyPlaylists() {
  const [spotifyPlaylist, setSpotifyPlaylist] = useState([]);
  const [youtubePlaylist, setYoutubePlaylist] = useState([]);

  const [playlistSongsYoutube, setPlaylistSongsYoutube] = useState([]);
  const [filteredPlaylist, setFilteredPlaylist] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [playlistLink, setPlaylistLink] = useState("");
  const [playlistName, setPlaylistName] = useState("");

  let selectedPlaylists = [];

  useEffect(() => {
    setFilteredPlaylist(youtubePlaylist);  // Change here
  }, [youtubePlaylist]);

  const clampToRange = (value, min, max) => {
    const clampValue = Math.max(min, Math.min(value, max));
    const mappedValue = ((clampValue - min) / max - min) * 100;
    return mappedValue;
  };

  const convertPlaylist = async () => {
    setPlaylistSongsYoutube([]);
    if (playlistLink) {
      const playlistId = playlistLink.split("=")[1];
      loadPlaylist(playlistId);
    } else {
      selectedPlaylists.forEach((item, index) => {
        loadPlaylist(item);
      });
    }
  };

  const getPlaylistLength = async (playlistSource, playlistId) => {
    const playlistLength = await axios(
      `http://localhost:8000/api/${playlistSource}/get-length/${playlistId}`,
    );
    return playlistLength
  }

  const loadPlaylist = async (playlistSource, playlistDestination, playlistId) => {
    const playlistLength = await getPlaylistLength(playlistSource, playlistId)
    let i = 0;
    const eventSource = new EventSource(
      `http://localhost:8000/api/${playlistDestination}/add-songs/${playlistId}`,
    );
    if (typeof EventSource !== "undefined") {
      console.log("macarena");
    } else {
      console.log("cacat");
    }
    eventSource.onmessage = (event) => {
      const eventData = JSON.parse(event.data);
      setPlaylistSongsYoutube((prevSongs) => [...prevSongs, eventData.message]);
      i++;
      let progress = clampToRange(i, 0, playlistLength.data).toFixed(2);
      setLoadingProgress(progress);
    };
    return () => {
      eventSource.close();
    };
  };

  const getPlaylistsSpotify = async () => {
    try {
      const playlistData = await axios.get(
        "http://localhost:8000/api/spotify/playlist",
      );
      setSpotifyPlaylist(playlistData.data);
      console.log(playlistData.data);
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  };

  const getPlaylistsYoutube = async () => {
    try {
      const playlistData = await axios.get(
        "http://localhost:8000/api/youtube/playlists",
      );
      setYoutubePlaylist(playlistData.data);
      console.log(playlistData.data);
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  };


  const selectPlaylist = (id) => {
    selectedPlaylists.push(id);
    console.log(selectedPlaylists);
  };

  const removePlaylist = (id) => {
    selectedPlaylists = selectedPlaylists.filter((item) => item !== id);
    console.log(selectedPlaylists);
  };

  const handleSearchChange = (event) => {
    const newSearchTerm = event.target.value;
    console.log(newSearchTerm);
    setPlaylistName(newSearchTerm);

    const filteredData = youtubePlaylist.filter((item) =>  // Change here
      item.name.toLowerCase().includes(newSearchTerm.toLowerCase()),
    );
    console.log(filteredData);
    setFilteredPlaylist(filteredData);
  };
  return (
    <Fragment>
      <div className="border-grey-200 flex justify-between rounded-lg border bg-gray-900">
        <div className="m-5 mt-2 flex max-h-[46rem] w-[42rem] flex-col rounded-3xl bg-gray-800 p-5 px-3 py-2 font-mono text-sm font-semibold text-white shadow-sm">
          <Button onClickHandle={ getPlaylist } name="Get from your playlists" />
          <div className="z-100 max-h-[42rem] max-w-2xl flex-grow flex-col justify-center overflow-y-auto overflow-x-hidden">
            <input
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="Search playlist..."
              type="text"
              value={playlistName}
              onChange={handleSearchChange}
              onInput={handleSearchChange}
            ></input>
            {filteredPlaylist.map((item, index) => (
              <SpotifyPlaylistItem
                selectPlaylist={() => selectPlaylist(item.id)}
                removePlaylist={() => removePlaylist(item.id)}
                name={item.name}
                id={item.id}
                image={item.images}
                key={index}
              />
            ))}
          </div>
          <div className="float-right">
            <Button onClickHandle={convertPlaylist} name="Convert Playlist" />
          </div>
        </div>

        <p className="font-heebo text-white"> or use a link </p>

        <div className="m-5 mt-2 h-48 w-[46rem] rounded-3xl bg-gray-800 p-5 px-3 py-2 font-heebo text-sm font-semibold text-white shadow-sm">
          <div className="item-center flex-1 flex-col justify-center ">
            <input
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="Playlist link"
              type="text"
              value={playlistLink}
              onChange={(e) => setPlaylistLink(e.target.value)}
            ></input>
            <div className="float-right">
              <Button onClickHandle={convertPlaylist} name="Convert Playlist" />
            </div>
          </div>
          <LoadingBar progress={loadingProgress} />
          <div className="z-100 flex max-h-40 flex-1 justify-center overflow-y-auto">
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
