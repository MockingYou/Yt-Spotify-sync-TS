import { useState, Fragment } from "react";
import LoadingRadial from "../Loading/LoadingRadial";
import RotationIcon from "../Icons/RotationIcon";
import { PlusIcon, MinusCircleIcon } from "@heroicons/react/24/outline";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import PlaylistSong from "./PlaylistSong";

const PlaylistItem = ({name, id, removePlaylist, image, selectPlaylist, source}) => {
  const [playlistSongsSpotify, setPlaylistSongsSpotify] = useState([]);
  const [loading, setLoading] = useState(false);
  const [collapsedSongs, setCollapsedSongs] = useState(true);
  const [selected, setSelected] = useState(false);

  const getPlaylistSongs = async (playlistId: string) => {
    try {
      console.log(source)
      setLoading(true);
      const playlistSongs = await axios.get(
        `http://localhost:8000/api/${source.name}/playlist-songs/${playlistId}`,
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
      getPlaylistSongs(id);
    } else {
      setCollapsedSongs(!collapsedSongs);
    }
  };
  
  return (
    <Fragment>
      <div className="m-2 w-full items-center justify-between">
        <div className="m-2 flex w-full shrink-0 items-center justify-between">
          <span className="flex items-center">
            {source != "" ?  (selected ? (
              <MinusCircleIcon
                className="mr-4 h-6 w-6 cursor-pointer text-purple-500"
                onClick={() => {
                  setSelected(false);
                  removePlaylist();
                }}
              />
            ) : (
              <PlusCircleIcon
                className="mr-4 h-6 w-6 cursor-pointer text-purple-500"
                onClick={() => {
                  setSelected(true);
                  selectPlaylist();
                }}
              />)) : "" }

            <img
              className="mr-4 h-14 w-16 rounded"
              src={source.name === "spotify" ? image[0].url : image}
              alt="image description"
            />
            {name}
            {loading && <LoadingRadial />}
          </span>
          {source != "" ? <RotationIcon
            handleClick={handleCollapseExpand}
            collapsedSongs={collapsedSongs}
          /> : ""}
        </div>
        <div className="m-2 flex max-w-fit flex-col pl-4">
          {!collapsedSongs &&
            playlistSongsSpotify.map((item, index) => (
              <PlaylistSong
                artist={item.artist}
                track={item.track}
                image={item.image}
                key={index}
              />
            ))}
        </div>
      </div>
    </Fragment>
  );
};

export default PlaylistItem;
