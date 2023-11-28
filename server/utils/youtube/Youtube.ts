import axios from "axios";
import { google } from "googleapis";
import ytdl from "ytdl-core";
import dotenv from "dotenv";
import config from "../config.json";
import AuthData from "../AuthData";
import Song from "../interfaces/songs/Song";
import Token from "../interfaces/tokens/Token"

import { checkFullName, normalizeString } from "../methods/FilterSongs";
dotenv.config();

type MyAuthData = Omit<AuthData, "spotifyApi" | "spotifyToken">;
type K = { [key: string]: any; };

export default class Youtube {
	public isLogged: boolean = false;
	private baseApiUrl: string = "https://www.googleapis.com/youtube/v3";
	private ytUrl: string = "https://www.youtube.com/watch?v=";
	myAuthData: MyAuthData;
	constructor() {
		this.myAuthData = {
			clientId: process.env.CLIENT_ID_GOOGLE || "",
			clientSecret: process.env.CLIENT_SECRET_GOOGLE || "",
			redirectUri: config.google.redirect_uris[0],
			youtubeApi: new google.auth.OAuth2(),
			youtubeApiKey: process.env.YOUTUBE_API_KEY || "",
		};
		this.myAuthData.youtubeApi = new google.auth.OAuth2(
			this.myAuthData.clientId,
			this.myAuthData.clientSecret,
			this.myAuthData.redirectUri
		);
	}
    generateAuthUrl = (): string => {
        return this.myAuthData.youtubeApi.generateAuthUrl({
            access_type: 'offline',
            scope: config.google.scopes
        })
    }
	getAuthToken = async (code: string): Promise<Token> => {
		const tokenResponse = await this.myAuthData.youtubeApi.getToken(code);
		const youtubeToken = tokenResponse.tokens.access_token as string;
		console.log(`Successfully retrieved youtube access token.`);
		return {
			access_token: youtubeToken,
            token_source: "youtube_token"
		}
	};

	getPlaylistTitle = async (playlistId: string): Promise<string> => {
		try {
			const url = `${this.baseApiUrl}/playlists?part=snippet&id=${playlistId}&key=${this.myAuthData.youtubeApiKey}`;
			const response = await axios.get(url);
			const playlist: K = response.data.items[0];
            
			return playlist.snippet.title;
		} catch (error) {
			console.log(error);
			throw new Error("Failed to fetch playlist information");
		}
	};
	extractSongsFromYouTube = async (item: Array<K>): Promise<Array<Song>> => {
		const url = "https://www.youtube.com/watch?v=";
		const songs: Array<Song> = [];
	
		for (let i = 0; i < item.length; i++) {
		  const videoId = item[i].snippet.resourceId.videoId;
		  const video_url = url + videoId;
		  try {
			const details = await ytdl.getBasicInfo(video_url);
			const filter = checkFullName(details);
			const track = normalizeString(filter.track);
			const artist = normalizeString(filter.artist);
			songs.push({ track, artist });
		  } catch (error) {
			console.error(error);
		  }
		}
		return songs;
	  };
	  getTotalSongs = async (
		playlistId: string,
		nextPageToken: string | null = null,
		totalSongs: number = 0,
		songs: Array<Song> = []
	  ): Promise<Array<Song>> => {
		try {
		  const maxResults = 50; // Maximum results per page (50 is the maximum allowed by the YouTube Data API).
		  let url = `${this.baseApiUrl}/playlistItems?part=snippet&playlistId=${playlistId}&key=${this.myAuthData.youtubeApiKey}&maxResults=${maxResults}`;
		  if (nextPageToken) {
			url += `&pageToken=${nextPageToken}`;
		  }
	
		  const response = await axios.get(url);
		  const { items, nextPageToken: newNextPageToken } = response.data;
	
		  const info = await this.extractSongsFromYouTube(items);
		  songs.push(...info);
		  totalSongs += items.length;
	
		  if (newNextPageToken) {
			return this.getTotalSongs(playlistId, newNextPageToken, totalSongs, songs );
		  } else {
			return songs;
		  }
		} catch (error) {
		  console.error(error);
		  throw new Error("Failed to fetch playlist data");
		}
	  };
}