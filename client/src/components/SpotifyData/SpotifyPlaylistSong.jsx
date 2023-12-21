import React, { useState, useEffect, Fragment } from "react";
import { ArrowRightCircleIcon } from "@heroicons/react/24/outline";
import { MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/24/solid";

const SpotifyPlaylistSong = (props) => {
  return (
    <Fragment>
      <div className="flex w-full items-center justify-between space-x-4">
        {props && (
          <div className="flex items-center justify-center ml-12">
            <ArrowRightCircleIcon className="m-4 mr-6 h-6 w-6 " />
            <p className="m-4">
              {props.artist} - {props.track}
            </p>
          </div>
        )}
		<MinusCircleIcon className="ml-6 h-6 w-6 text-purple-500" />
      </div>
    </Fragment>
  );
};

export default SpotifyPlaylistSong;
