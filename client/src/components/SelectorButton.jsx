import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const SelectorButton = props => {
	return (
		<button
			onClick={props.handleLogin}
			className={`rounded-3xl bg-gray-800 px-3 py-2 text-sm font-mono font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 m-5 w-48 h-48 ${
				props.loggedIn ? (props.name == "Spotify" ? "bg-green-500" : "bg-red-500") : ""
			}`}
			disabled={props.loggedIn}
		>
			<div className="text-2xl">
				<p>
					<FontAwesomeIcon icon={props.icon} size="lg" /> {props.name}
				</p>
			</div>
		</button>
	);
};

export default SelectorButton;
