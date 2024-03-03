import axios from "axios";
import showToast from '../components/Toast/showToast';
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export const clampToRange = (value: number, min: number, max: number) => {
  const clampValue = Math.max(min, Math.min(value, max));
  const mappedValue = ((clampValue - min) / max - min) * 100;
  return mappedValue;
};

export const getPlaylists = async (source: string, setPlaylist: Function) => {
  try {
    const playlistData = await axios.get(`http://localhost:8000/api/${source}/playlists`);
    setPlaylist(playlistData.data);
  } catch (error) {
    console.error("Error fetching playlists:", error);
    showToast({ title: "Error", message: "Failed to fetch playlists", icon: CheckCircleIcon, color: "red" });
  }
};

export const getSongs = async (source: string, sourceLink: string, setPlaylist: Function, setLinkItem: Function) => {
  let playlistId = "";
  try {
    if (source === 'spotify' && sourceLink.includes("open.spotify.com/playlist")) {
      playlistId = sourceLink.split("playlist/")[1];
    } else if (source === 'youtube' && sourceLink.includes("youtube.com/playlist")) {
      playlistId = sourceLink.split("list=")[1];
    } else {
      console.log("Input Link invalid");
    }
    const playlistData = await axios.get(`http://localhost:8000/api/${source}/playlist-songs/${playlistId}`);  
    const linkItem = await getPlaylistData(source, playlistId);
    setLinkItem(linkItem);
    setPlaylist(playlistData.data);
  } catch (error) {
    console.error("Error fetching songs:", error);
    showToast({ title: "Error", message: "Failed to fetch songs", icon: CheckCircleIcon, color: "red" });
  }
};

export const getPlaylistData = async (source: string, playlistId: string) => {
  try {
    const linkData = await axios.get(`http://localhost:8000/api/${source}/playlist-title/${playlistId}`);  
    return linkData.data;
  } catch (error) {
      console.log("Error fetching playlists:");
      showToast({ title: "Error", message: "Failed to fetch playlist data", icon: CheckCircleIcon, color: "red" });
  }
};