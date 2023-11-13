import express, { Express, Request, Response, Application } from "express";
import dotenv from "dotenv";
import config from "./utils/config.json"
import Spotify from "./utils/Spotify/Spotify"
import Youtube from "./utils/Youtube/Youtube"
import AuthData from "./utils/AuthData";
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;
const spotify_scopes = config.spotify.scopes;

const spotify = new Spotify();
const youtube = new Youtube();
//  ================== Spotify APIs ======================

app.get('/spotify/login', (req, res) => {
    res.redirect(spotify.myAuthData.spotifyApi.createAuthorizeURL(spotify_scopes, ""));
});

app.get('/spotify/callback', async (req, res) => {
    const code: any = req.query.code;
    try {
        let access_token = await spotify.getAuthToken(code)
        console.log(access_token)
        res.send('Success! You can now close the window.');
    } catch (error) {
        console.error("Error getting tokens:", error);
        throw error;
    }
});

app.get('/api/spotify/playlistTitle/:playlistId', async(req, res) =>{
    try {
        const playlistId: string = req.params.playlistId;
        const title: string = await spotify.getPlaylistTitle(playlistId);
        res.json(title)
    } catch (error: any) {
        console.error("Error fetching playlist title:", error.message);
        throw error;
    }
});

app.get('/api/spotify/playlist/:playlistId', async(req, res) =>{
    try {
        const playlistId: string = req.params.playlistId;
        const songs = await spotify.getPlaylistSongs( playlistId)
        res.json(songs)
    } catch (error: any) {
        console.error("Error fetching playlist title:", error.message);
        throw error;
    }
});

app.post('/api/spotify/create-playlist', async (req,res) => {
    try {
        const playlistId = await spotify.createPlaylist("Marcel Te Vede");
        res.json(playlistId)
    } catch (error) {
        console.log("Failed to create or retrieve playlist", error);
        throw error;
    }
})

app.post('/api/spotify/add-songs/:playlistId', async (req, res) => {
    try {
        const ytPlaylistId: string = req.params.playlistId;
        const songs = await youtube.getTotalSongs(ytPlaylistId)
        let searchArray = []

        console.log("=================================")
        console.log(songs)
        for(const song of songs) {
            try {
                const searchedSong = await spotify.searchSongs(song);
                searchArray.push(searchedSong);
              } catch (error) {
                console.log('Error searching song:', error);
              }
        }
        await spotify.addSongsToPlaylist(ytPlaylistId, songs);

    } catch (error) {
        console.log("Failed to create or retrieve playlist", error);
        throw error;
    }
})

//  ================== Spotify APIs ======================


app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});

