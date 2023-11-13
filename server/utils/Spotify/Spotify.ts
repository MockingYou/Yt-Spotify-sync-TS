import SpotifyWebApi from "spotify-web-api-node";
import Playlist from "../songs/Playlist";
import AuthData from "../AuthData";
import Song from "../songs/Song";
import dotenv from "dotenv";
import config from "../config.json"
dotenv.config();

type MyAuthData = Omit<AuthData, "youtubeApi" | "youtubeToken">

export default class Spotify {
    myAuthData : MyAuthData;
    constructor() {
        this.myAuthData = {
            clientId: process.env.CLIENT_ID_SPOTIFY || '',
            clientSecret: process.env.CLIENT_SECRET_SPOTIFY || '',
            redirectUri: config.spotify.redirect_uris[0],
            spotifyApi: new SpotifyWebApi() as SpotifyWebApi,
            spotifyToken: ""
        };

        this.myAuthData.spotifyApi = new SpotifyWebApi({
            clientId: this.myAuthData.clientId,
            clientSecret: this.myAuthData.clientSecret,
            redirectUri: this.myAuthData.redirectUri
        });
    }

    async getAuthToken(code: string): Promise<string | Error> {
        const data = await this.myAuthData.spotifyApi.authorizationCodeGrant(code);
        const spotifyToken = data.body["access_token"];
        const refreshToken = data.body["refresh_token"];
        const expiresIn = data.body["expires_in"];
        this.myAuthData.spotifyApi.setAccessToken(spotifyToken);
        this.myAuthData.spotifyApi.setRefreshToken(refreshToken);
        console.log(
            `Successfully retrieved access token. Expires in ${expiresIn} s.`
        );
        setInterval(async () => {
            try {
                const tokenData =
                    await this.myAuthData.spotifyApi.refreshAccessToken();
                const newAccessToken = tokenData.body["access_token"];
                console.log("The access token has been refreshed!");
                this.myAuthData.spotifyApi.setAccessToken(newAccessToken);
            } catch (refreshError) {
                console.error(
                    "Error refreshing access token:",
                    refreshError
                );
            }
        }, (expiresIn / 2) * 1000);
        this.myAuthData.spotifyToken = spotifyToken;
        return spotifyToken;
    }

    getPlaylistTitle = async (playlistId: string): Promise<string> => {
        const playlist = await this.myAuthData.spotifyApi.getPlaylist(playlistId);
        const playlistTitle = playlist.body.name;
        return playlistTitle;
    };

    createPlaylist = async (playlistTitle: string): Promise<String> => {
        const playlistData = await this.myAuthData.spotifyApi.createPlaylist(
            playlistTitle,
            { description: "Youtube Playlist", public: true }
        );
        const spotifyPlaylistId = playlistData.body.id;
        console.log("Created playlist with ID:", spotifyPlaylistId);
        return spotifyPlaylistId; // Return the playlist ID if needed
    };

    searchSongs = async (song: Song): Promise<string> => {
        try {
            const songs = await this.myAuthData.spotifyApi.searchTracks(
                `${song.track} ${song.artist}`
            );
            // console.log(`Search tracks by "${track}" in the track name and "${artist}" in the artist name`);
            let trackId = `spotify:track:${songs.body.tracks?.items[0].id}`;
            return trackId;
        } catch (error) {
            console.log("Something went wrong!", error);
            throw error;
        }
    };

    addSongsToPlaylist = async (
        playlistId: string,
        songs: Array<Song>
    ): Promise<void> => {
    // ): Promise<Playlist | Error> => {

        try {
            const maxSongsPerRequest = 100;
            const batches: Song[][] = [];
            const playlistTitle = await this.getPlaylistTitle(playlistId);
            for (let i = 0; i < songs.length; i += maxSongsPerRequest) {
                batches.push(songs.slice(i, i + maxSongsPerRequest));
            }
            for (const batch of batches) {
                const trackNames = batch.map(song => song.track);
                await this.myAuthData.spotifyApi.addTracksToPlaylist(playlistId, trackNames);
                console.log(batch)
                console.log("Added songs to playlist!");
            }
            // const updatedPlaylist: Playlist = batches.map((batch) => ({
            //     id: playlistId,
            //     title: playlistTitle, 
            //     songNames: {
            //         batch
            //     }, 
            // }));
            // return updatedPlaylist;
        } catch (error) {
            console.log("Something went wrong!", error);
            throw error;
        }
    };
    async getPlaylistSongs(playlistId: string): Promise<Array<Song> | Error> {
        try {
            const allSongs: Array<Song> = [];
            const maxResults = 100;
            let offset = 0;
            let hasSongs = true; // Set initially to true to start the loop
            const playlistTracks = await this.myAuthData.spotifyApi.getPlaylistTracks(playlistId, {
                fields: 'total',
              });
            const playlistLength = playlistTracks.body.total;

            do {
                const playlistTracksData =
                    await this.myAuthData.spotifyApi.getPlaylistTracks(playlistId, {
                        offset,
                        limit: maxResults,
                        fields: "items(track(name,artists(name)))",
                    });

                const playlistItems = playlistTracksData.body.items;

                const songs: Array<Song> = playlistItems.map((item) => ({
                    artist: item.track?.artists[0].name || "Unknown Artist",
                    track: item.track?.name || "Unknown Track",
                }));

                allSongs.push(...songs);

                if (offset >= playlistLength) {
                    hasSongs = false;
                } else {
                    offset += maxResults;
                }
            } while (hasSongs);
            return allSongs;
        } catch (error) {
            console.error("Error getting playlist songs:", error);
            throw error;
        }
    }
}
