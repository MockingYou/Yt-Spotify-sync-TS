import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "http://localhost:8080/api/";

const getPlaylists = async (source: string) => {
    return await axios.get(`${API_URL}${source}/playlists`);
}

const getPlaylistLength = async (source: string, id: string) => {
    return await axios.get(`${API_URL}${source}/get-length/${id}`);
}

const getPlaylistSongs = async (source: string, id: string) => {
    return await axios.get(`${API_URL}${source}/playlist-songs/${id}`);
}

export default {
    getPlaylists,
    getPlaylistLength,
    getPlaylistSongs
}