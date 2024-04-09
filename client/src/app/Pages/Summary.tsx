import { Fragment, useEffect, useState } from "react";
import { getSongs } from "../HelperFunctions/helperFunction";
import PlaylistItem from "../components/PlaylistData/PlaylistItem";
import PlaylistSong from "../components/PlaylistData/PlaylistSong";


 const Summary = ({ source, playlistLink }) => {
	const [linkItem, setLinkItem] = useState(null);
	const [sourceLinkPlaylist, setSourceLinkPlaylist] = useState(null);

	const handlePlaylist = () => {
		getSongs(source.name, playlistLink)
		  .then((data) => {
			setLinkItem(data.linkItem);
			setSourceLinkPlaylist(data.playlist)
		  })
		  .catch((error) => {
			console.error("Error fetching songs:", error);
		  });
	  };
	useEffect(() => {
		handlePlaylist()
	}, [])
	return (
		<Fragment>
		    <div className="flex items-center justify-center h-screen">
		        <div className="m-5 mt-2 max-h-[46rem] w-[42rem] bg-gray-800 p-5 px-3 py-2 font-mono text-sm font-semibold text-white shadow-sm rounded-3xl">
		            <div className="z-100 max-h-[42rem] max-w-2xl flex-grow flex-col justify-center overflow-y-auto overflow-x-hidden">
		                {linkItem && <PlaylistItem selectPlaylist={() => {}} removePlaylist={() => {}} id={linkItem.id} name={linkItem.title} image={linkItem.image} source={""}  />}
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
		        </div>
		    </div>
		</Fragment>

	)
 }

 export default Summary;