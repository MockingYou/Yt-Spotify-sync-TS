import NavBar from "./components/NavBar";
import NotFound from "./Pages/NotFound";
import Home from "./Pages/Home";
import SourceSelector from "./Pages/SourceSelector";
import PlaylistSelector from "./Pages/PlaylistSelector";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Fragment, useState } from "react";

export default function App() {
  const [source, setSource] = useState({
	  index: null,
	  link: "",
    name: ""
  });
  const [destination, setDestination] = useState({
	  index: null,
	  link: "",
    name: ""
  });

  return (
    <Fragment>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route element={<NotFound />} path="/*" />
          <Route element={<Home />} path="/" />
          <Route element={<Home />} path="/home" />
          <Route
            element={
              <SourceSelector
                source={source}
                destination={destination}
                setSource={setSource}
                setDestination={setDestination}
              />
            }
            path="/sourceselector"
          />
          <Route
            element={
              <PlaylistSelector
                source={source}
                destination={destination}
              />
            }
            path="/playlistselector"
          />
        </Routes>
      </BrowserRouter>
    </Fragment>
  );
}
