import React, { useState } from "react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

const RotationIcon = (props) => {
  // const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`rotate-item ${!props.collapsedSongs ? "rotate-90" : ""} inline-block cursor-pointer p-4 transition-transform duration-300 ease-in-out`}
    >
      <ChevronRightIcon
        onClick={props.onClickHandle}
        className="m-4 mr-6 h-6 w-6 text-purple-500"
      />
    </div>
  );
};

export default RotationIcon;
