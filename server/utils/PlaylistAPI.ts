// import Song from "./songs/Song";
// import AuthData from "./AuthData";

// type Spotify = Pick<AuthData, "oauthClient" | "oauthToken">;
// type Youtube = Pick<AuthData, "spotifyApi">;

// export default interface PlaylistAPI {
//     getPlaylistData(playlistId: string): Promise<string>;
//     createPlaylist(playlistTitle: string, options: Spotify | Youtube): Promise<string>;
//     searchSong(song: Song, apiKey: string): Promise<string>;
//     addTracksToPlaylist(playlistId: string, tracks: string[]): Promise<void>;
//     getPlaylistSongs(playlistId: string, apiKey: string): Promise<string[]>;
// }
