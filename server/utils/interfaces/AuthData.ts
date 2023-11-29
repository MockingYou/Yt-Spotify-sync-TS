import SpotifyWebApi from "spotify-web-api-node";
import { OAuth2Client } from "google-auth-library";

export default interface AuthData {
    clientId: string,
    clientSecret: string,
    spotifyApi: SpotifyWebApi,
    youtubeApi: OAuth2Client,
    redirectUri: string,
    youtubeApiKey?: string 
}
