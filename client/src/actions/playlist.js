import { GET_PLAYLISTS, GET_LENGTH, GET_SONGS  } from "./types"

export const getPlaylists = (playlist) => ({
    type: GET_PLAYLISTS,
    payload: playlist,
});

export const getLength = (playlistLength) => ({
    type: GET_LENGTH,
    payload: playlistLength,
});


export const getSongs = (playlistSongs) => ({
    type: GET_LENGTH,
    payload: playlistSongs,
});