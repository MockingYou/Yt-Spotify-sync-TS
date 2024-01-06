import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

const SelectorButton = (props) => {
  return (
    <Link
      onClick={props.handleLogin}
      className={`bg-gray-800 font-mono align-center text-white hover:bg-gray-700 focus-visible:outline-indigo-600 m-5 h-48 w-48 rounded-3xl px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
        props.loggedIn
          ? props.name == "Spotify"
            ? "bg-green-500"
            : "bg-red-500"
          : ""
      }`}
      disabled={props.loggedIn}
      to={props.to}
    >
        <p className="text-2xl">
          <FontAwesomeIcon icon={props.icon} size="lg" /> {props.name}
        </p>
    </Link>
  );
};

export default SelectorButton;
