import React, { Fragment } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

const SelectorButton = ({
  handleLogin,
  loggedIn,
  route,
  icon,
  name,
  source,
}) => {
  return (
    <Fragment>
      {source && (
        <div className="rounded-lg border-8 border-black">
          <p className="mb-2 -translate-y-4 text-sm font-semibold text-neutral-50">
            Source:
          </p>
          <Link
            onClick={handleLogin}
            className={`
          font-mono m-5 flex h-48 w-48 
          flex-col items-center justify-center rounded-3xl bg-gray-800 px-3 py-2 text-sm font-semibold 
          text-white shadow-sm hover:bg-gray-700 
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
          ${
            loggedIn ? (name === "Spotify" ? "bg-green-500" : "bg-red-500") : ""
          }
          
        `}
            disabled={loggedIn}
            to={route}
          >
            <p className="text-2xl">
              <FontAwesomeIcon icon={icon} size="lg" /> {name}
            </p>
          </Link>
          {/* Your content goes here */}
        </div>
      )}
    </Fragment>
  );
};

export default SelectorButton;
