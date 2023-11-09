import { google } from "googleapis"
import SpotifyWebApi from "spotify-web-api-node";
import AuthData from "../AuthData";
import dotenv from "dotenv";
import config from "../config.json"
dotenv.config();

type MyAuthData = Omit<AuthData, "spotifyApi" | "spotifyToken">


export default class Youtube {
    myAuthData : MyAuthData;

    constructor() {
        this.myAuthData = {
            clientId: process.env.CLIENT_ID_GOOGLE || '',
            clientSecret: process.env.CLIENT_SECRET_GOOGLE || '',
            redirectUri: config.google.redirect_uris[0],
            youtubeApi: new google.auth.OAuth2(),
            youtubeToken: ""
        }
        this.myAuthData.youtubeApi = new google.auth.OAuth2(
            this.myAuthData.clientId,
            this.myAuthData.clientSecret,
            this.myAuthData.redirectUri
        );
    }
    async getAuthToken(code: string): Promise<string | null | undefined > {
        const tokenResponse = await this.myAuthData.youtubeApi.getToken(code);
        const youtubeToken = tokenResponse.tokens.access_token;
        console.log("Your token: " + youtubeToken)
        this.myAuthData.youtubeToken =  youtubeToken

        return youtubeToken
    }

}