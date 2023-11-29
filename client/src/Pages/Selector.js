import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpotify, faYoutube } from "@fortawesome/free-brands-svg-icons";

const Selector = () => {
    const [spotifyLoggedIn, setSpotifyLoggedIn] = useState(false);
    const [youtubeLoggedIn, setYoutubeLoggedIn] = useState(false);
    const [loading, setLoading] = useState(false);
    const [playlistLink, setPlatlistLink] = useState("");
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const popupWidth = 600;
    const popupHeight = 900;
    const left = (screenWidth - popupWidth) / 2;
    const top = (screenHeight - popupHeight) / 2;

    const handleSpotifyLogin = async () => {
        try {
            const popup = window.open(
                "http://localhost:8000/spotify/login",
                "_blank",
                `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`
            );
            const messageHandler = (event) => {
                if (event.data == "Success! You can now close the window.") {
                    setSpotifyLoggedIn(true);
                    popup.close();
                    window.removeEventListener("message", messageHandler);
                }
            };
            window.addEventListener("message", messageHandler);
        } catch (error) {
            console.error("Error during Spotify login:", error);
        }
    };

    const handleYoutubeLogin = () => {
        try {
            const popup = window.open(
                "http://localhost:8000/google/login",
                "_blank",
                `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`
            );
            window.addEventListener("message", (event) => {
                if (event.data === "Success! You can now close the window.") {
                    setYoutubeLoggedIn(true);
                    // Close the popup
                    popup.close();
                }
            });
        } catch (error) {
            console.error("Error during Spotify login:", error);
        }
    };

    const convertPlaylist = async () => {
        try {
            setLoading(true)
            const playlistId = playlistLink.split("=")[1];
            console.log(playlistId);
            const response = await axios.post(
                `http://localhost:8000/api/spotify/add-songs/${playlistId}`
            );
            console.log(response.data);
        } catch (error) {
            console.error("Error getting Playlist:", error.message);
        }
        setLoading(false)
    };

    return (
        <>
            <input
                placeholder="Playlist link"
                type="text"
                value={playlistLink}
                onChange={(e) => setPlatlistLink(e.target.value)}
            ></input>
            <button className="w-20" onClick={convertPlaylist}>
                <p>Convert Playlist</p>
            </button>
            <div className="h-screen bg-gray-900 w-full flex justify-center items-center">
                <button
                    onClick={handleSpotifyLogin}
                    className={`rounded-3xl bg-gray-800 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 m-5 w-48 h-48 ${
                        spotifyLoggedIn ? "bg-green-500" : ""
                    }`}
                    disabled={spotifyLoggedIn}
                >
                    <div className="text-2xl">
                        <p>
                            <FontAwesomeIcon icon={faSpotify} size="lg" />{" "}
                            Spotify
                        </p>
                    </div>
                </button>
                <button
                    onClick={handleYoutubeLogin}
                    className={`rounded-3xl bg-gray-800 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 m-5 w-48 h-48 ${
                        youtubeLoggedIn ? "bg-red-500" : ""
                    }`}
                    disabled={youtubeLoggedIn}
                >
                    <div className="text-2xl">
                        <p>
                            <FontAwesomeIcon icon={faYoutube} size="lg" />{" "}
                            Youtube
                        </p>
                    </div>
                </button>
            </div>
        </>
    );
};

export default Selector;
