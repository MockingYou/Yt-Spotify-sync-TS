import { Fragment, useEffect, useState } from "react";
import Playlists from "../components/PlaylistData/Playlists";

const PlaylistSelector = ({ source, destination }) => {
  const [persistedSource, setPersistedSource] = useState(source);
  useEffect(() => {
    const persistedSourceJson = localStorage.getItem("source");
    if (persistedSourceJson) {
      setPersistedSource(JSON.parse(persistedSourceJson));
    }
  }, []);

  return (
    <Fragment>
      <div className="flex h-screen flex-col items-center justify-center bg-gray-900">
        <h1>Step 2</h1>
        <p className="text-center text-white">Select a playlist:</p>
        <Playlists source={persistedSource} destination={destination} />
      </div>
    </Fragment>
  );
};

export default PlaylistSelector;
