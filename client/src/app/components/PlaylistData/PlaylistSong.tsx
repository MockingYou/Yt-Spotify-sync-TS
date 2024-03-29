import { Fragment } from "react";
import { ArrowRightCircleIcon, MinusCircleIcon } from "@heroicons/react/24/solid";

const PlaylistSong = (props) => {
  return (
    <Fragment>
      <div className="flex w-full items-center justify-between">
        {props && (
          <div className="flex items-center justify-center ml-12">
            <ArrowRightCircleIcon className="m-4 mr-6 h-6 w-6 min-h-6 min-w-6 flex-shrink-0" />
            <img
              className="mr-4 h-10 w-12 rounded"
              src={props.image}
              alt="image description"
            />
            <p className="m-4">
              {props.artist} - {props.track}
            </p>
          </div>
        )}
        <MinusCircleIcon className="ml-6 mr-6 h-6 w-6 text-purple-500 flex-shrink-0 cursor-pointer" />
      </div>
    </Fragment>
  );
};

export default PlaylistSong;
