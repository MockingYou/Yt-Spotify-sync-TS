import SpotifyWebApi from "spotify-web-api-node";
import { OAuth2Client } from "google-auth-library";
import Token from "../interfaces/tokens/Token";

export default interface AuthData {
    clientId: string,
    clientSecret: string,
    token?: Token,
    spotifyApi: SpotifyWebApi,
    youtubeApi: OAuth2Client,
    redirectUri: string,
    youtubeApiKey?: string 
}
