import axios from "axios";

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
  }
};

export const getSongs = async (source: string, sourceLink: string, setPlaylist: Function) => {
  try {
    const playlistId = sourceLink.split("playlist/")[1];
    const playlistData = await axios.get(`http://localhost:8000/api/${source}/playlist-songs/${playlistId}`);  
    setPlaylist(playlistData.data);
  } catch (error) {
    console.error("Error fetching playlists:", error);
  }
}