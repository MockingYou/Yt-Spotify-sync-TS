import { useState, useEffect, Fragment } from "react";
import axios from "axios";
import LoadingBar from "../Loading/LoadingBar";
import Button from "../Button";
import PlaylistItem from "./PlaylistItem";
import PlaylistSong from "./PlaylistSong"
import { clampToRange, getPlaylists, getSongs } from "../../helperFunctions/helperFunction"; // Importing helper functions

const Playlists = ({ source, destination }) => {
  const [sourcePlaylist, setSourcePlaylist] = useState(null);
  const [sourceLinkPlaylist, setSourceLinkPlaylist] = useState(null);
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [filteredPlaylist, setFilteredPlaylist] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [playlistLink, setPlaylistLink] = useState("");
  const [playlistName, setPlaylistName] = useState("");

  let selectedPlaylists = [];


  useEffect(() => {
    setFilteredPlaylist(sourcePlaylist);
  }, [sourcePlaylist]);

  const convertPlaylist = async () => {
    setPlaylistSongs([]);
    if (playlistLink) {
      const playlistId = playlistLink.split("=")[1];
      loadPlaylist(`${source.link}/${playlistId}`, `${destination.link}/${playlistId}`);
    } else {
      selectedPlaylists.forEach((item) => {
        loadPlaylist(item.link, item.link);
      });
    }
  };

  const loadPlaylist = async (sourceUrl: string, destinationUrl: string) => {
    const playlistLengthResponse = await axios(sourceUrl);
    const playlistLength = playlistLengthResponse.data;

    let i = 0;
    const eventSource = new EventSource(destinationUrl);
    if (typeof EventSource !== "undefined") {
      console.log("EventSource supported");
    } else {
      console.log("EventSource not supported");
    }
    eventSource.onmessage = (event) => {
      const eventData = JSON.parse(event.data);
      setPlaylistSongs((prevSongs) => [...prevSongs, eventData.message]);
      i++;
      let progress = clampToRange(i, 0, playlistLength);
      setLoadingProgress(progress);
    };
    return () => {
      eventSource.close();
    };
  };

  const selectPlaylist = (id: string) => {
    selectedPlaylists.push(id);
    console.log(selectedPlaylists);
  };

  const removePlaylist = (id: string) => {
    selectedPlaylists = selectedPlaylists.filter((item) => item !== id);
    console.log(selectedPlaylists);
  };

  const handleSearchChange = (event: any) => {
    const newSearchTerm = event.target.value;
    setPlaylistName(newSearchTerm);
    const filteredData = sourcePlaylist.filter((item: { name: string; }) =>
      item.name.toLowerCase().includes(newSearchTerm.toLowerCase())
    );
    setFilteredPlaylist(filteredData);
  };

  return (
    <Fragment>
      <div className="border-grey-200 flex justify-between rounded-lg border bg-gray-900">
        <div className="m-5 mt-2 flex max-h-[46rem] w-[42rem] flex-col rounded-3xl bg-gray-800 p-5 px-3 py-2 font-mono text-sm font-semibold text-white shadow-sm">
          <Button method={() => getPlaylists(source.name, setSourcePlaylist)} name="Get from your playlists" />
          <div className="z-100 max-h-[42rem] max-w-2xl flex-grow flex-col justify-center overflow-y-auto overflow-x-hidden">
            <input
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="Search playlist..."
              type="text"
              value={playlistName}
              onChange={handleSearchChange}
              onInput={handleSearchChange}
            ></input>
            {filteredPlaylist &&
              filteredPlaylist.map((item, index) => (
                <PlaylistItem
                  selectPlaylist={() => selectPlaylist(item.id)}
                  removePlaylist={() => removePlaylist(item.id)}
                  name={item.name}
                  id={item.id}
                  image={item.images}
                  key={index}
                  source={source}
                />
              ))}
          </div>
          <div className="float-right">
            <Button method={convertPlaylist} name="Choose destination" />
          </div>
        </div>

        <p className="font-mono text-white"> or use a link </p>

        <div className="m-5 mt-2 flex max-h-[46rem] w-[42rem] flex-col rounded-3xl bg-gray-800 p-5 px-3 py-2 font-mono text-sm font-semibold text-white shadow-sm">
          <div className="item-center flex-1 flex-col justify-center ">
            <input
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="Playlist link"
              type="text"
              value={playlistLink}
              onChange={(e) => setPlaylistLink(e.target.value)}
            ></input>
            <div className="z-100 max-h-[42rem] max-w-2xl flex-grow flex-col justify-center overflow-y-auto overflow-x-hidden">
              {sourceLinkPlaylist &&
                sourceLinkPlaylist.map((item, index) => (
                  <PlaylistSong
                    artist={item.artist}
                    track={item.track}
                    image={item.image}
                    key={index}
                  />
                ))}
            </div>
            <div className="float-right">
              <Button method={() => getSongs(source.name, playlistLink, setSourceLinkPlaylist)} name="Choose destination" />
            </div>
          </div>
          {loadingProgress < 100 && (
            <div>
              <LoadingBar progress={loadingProgress} />
              <div className="z-100 flex max-h-40 flex-1 justify-center overflow-y-auto">
                <ul className="list-disc">
                  {playlistSongs.map((item, index) => (
                    <li className="m-4" key={index}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default Playlists;
