import Playlist from "./songs/Playlist";
import Song from "./songs/Song";
import MyApplication from "./MyApplication";

type Spotify = Pick<MyApplication, "oauthClient" | "oauthToken">;
type Youtube = Pick<MyApplication, "spotifyApi">;

export default interface PlaylistAPI {
    getPlaylistTitle(playlistId: string): Promise<string>;
    createPlaylist(
        playlistTitle: string,
        options: Spotify | Youtube
    ): Promise<string>;
    searchSong(song: Song, apiKey: string): Promise<string>;
    addTracksToPlaylist(playlistId: string, tracks: string[]): Promise<void>;
    getPlaylistSongs(
        playlistId: string,
        apiKey: 
    ): Promise<string[]>;
}
