import express, { Express, Request, Response, Application } from "express";
import dotenv from "dotenv";
import config from "./config.json"
import Spotify from "./utils/Spotify/Spotify"
import AuthData from "./utils/AuthData";
//For env File
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;
const spotify_scopes = config.spotify.scopes;
const authData: AuthData = {
    clientId: process.env.CLIENT_ID_SPOTIFY,
    clientSecret: process.env.CLIENT_SECRET_SPOTIFY,
    redirectUri: config.spotify.redirect_uris[0],
}
const spotify = new Spotify(authData);

//  ================== Spotify APIs ======================

app.get('/spotify/login', (req, res) => {
    console.log(authData)
    res.redirect(spotify.spotifyApi.createAuthorizeURL(spotify_scopes, ""));
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

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});

