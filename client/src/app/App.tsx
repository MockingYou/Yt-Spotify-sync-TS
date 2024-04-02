import NavBar from "./components/NavBar";
import NotFound from "./Pages/NotFound";
import Home from "./Pages/Home";
import SourceSelector from "./Pages/SourceSelector";
import PlaylistSelector from "./Pages/PlaylistSelector";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Fragment, useState } from "react";
import Summary from "./Pages/Summary";

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
          <Route element={<Home
                source={source}
                destination={destination}
                setSource={setSource}
                setDestination={setDestination} 
            />} 
            path="/"
          />
          <Route element={<Home
                source={source}
                destination={destination}
                setSource={setSource}
                setDestination={setDestination} 
            />} 
            path="/home" 
          />
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
          <Route element={<Summary /> } path="/summary"
          />
        </Routes>
      </BrowserRouter>
    </Fragment>
  );
}
