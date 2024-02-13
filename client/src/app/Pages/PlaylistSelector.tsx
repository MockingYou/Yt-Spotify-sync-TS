import { Fragment } from "react";
import Playlists from "../components/PlaylistData/Playlists";

const PlaylistSelector = ({ source, destination }) => {
  
  return (
    <Fragment>
      <div className="flex h-screen flex-col items-center justify-center bg-gray-900">
        <h1>Step 2</h1>
        <p className="text-center text-white">Select a playlist:</p>
        <Playlists source={source} destination={destination} />
      </div>
    </Fragment>
  );
};

export default PlaylistSelector;
