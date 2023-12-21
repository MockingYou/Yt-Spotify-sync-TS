import React, { useState } from "react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

const RotatingIcon = (props) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`rotate-item ${
        isHovered ? "rotate-90" : ""
      } inline-block cursor-pointer p-4 transition-transform duration-300 ease-in-out`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ChevronRightIcon
        onClick={
          // playlistSongsSpotify ? setCollapsedSongs(false) :
          props.handleClick
        }
        className="m-4 mr-6 h-6 w-6 text-purple-500"
      />
    </div>
  );
};
export default RotatingIcon;