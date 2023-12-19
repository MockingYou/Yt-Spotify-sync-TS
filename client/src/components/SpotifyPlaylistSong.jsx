import React, { useState, useEffect, Fragment } from "react";
import axios from "axios";

const SpotifyPlaylistSong = (props) => {
	return (
		<Fragment>
			<div className="flex items-center justify-between space-x-4 w-full m-4">
				{props && `-> ${props.artist} - ${props.track}`}
			</div>
		</Fragment>
	);
};

export default SpotifyPlaylistSong;
