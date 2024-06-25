import axios from "axios";
import { showAlert } from "../components/Toast/Toast";
import PlaylistData from "../services/PlaylistDataServices/PlaylistData";

export const clampToRange = (value: number, min: number, max: number) => {
  const clampValue = Math.max(min, Math.min(value, max));
  const mappedValue = ((clampValue - min) / max - min) * 100;
  return mappedValue;
};

// Function to calculate popup position
export const calculatePopupPosition = (
  popupWidth: number,
  popupHeight: number,
) => {
  const left = window.screenX + (window.outerWidth - popupWidth) / 2;
  const top = window.screenY + (window.outerHeight - popupHeight) / 2;
  return { left, top };
};

export const getPlaylists = async (
  source: string,
  setPlaylist: (data) => void,
) => {
  try {
    const playlistData = await axios.get(
      `http://localhost:8000/api/${source}/playlists`,
    );
    setPlaylist(playlistData.data);
  } catch (error) {
    console.error("Error fetching playlists:", error);
    showAlert("error", "Error", "Failed to fetch playlists");
  }
};

export const getSongs = async (source: string, sourceLink: string) => {
  let playlistId = "";
  try {
    if (
      source === "spotify" &&
      sourceLink.includes("open.spotify.com/playlist")
    ) {
      playlistId = sourceLink.split("playlist/")[1];
    } else if (
      source === "youtube" &&
      sourceLink.includes("youtube.com/playlist")
    ) {
      playlistId = sourceLink.split("list=")[1];
    } else {
      console.log("Input Link invalid");
    }
    const playlistData = await axios.get(
      `http://localhost:8000/api/${source}/playlist-songs/${playlistId}`,
    );
    const linkItem = await getPlaylistData(source, playlistId);
    let playlistInfo = new PlaylistData(playlistData.data, linkItem);

    return playlistInfo;
  } catch (error) {
    console.error("Error fetching songs:", error);
    showAlert("error", "Error", "Failed to fetch songs");
  }
};

export const getPlaylistData = async (source: string, playlistId: string) => {
  try {
    const linkData = await axios.get(
      `http://localhost:8000/api/${source}/playlist-title/${playlistId}`,
    );
    return linkData.data;
  } catch (error) {
    console.log("Error fetching playlists:");
    showAlert("error", "Error", "Failed to fetch playlist data");
  }
};
