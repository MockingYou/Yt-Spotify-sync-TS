import axios from "axios";
import { google } from "googleapis";
import ytdl from "ytdl-core";
import dotenv from "dotenv";
import config from "../config.json";
import AuthData from "../AuthData";
import Song from "../songs/Song";
import { checkFullName, normalizeString } from "../methods/FilterSongs";
dotenv.config();

type MyAuthData = Omit<AuthData, "spotifyApi" | "spotifyToken">;
type K = { [key: string]: any; };

export default class Youtube {
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
			youtubeToken: "",
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
	getAuthToken = async (code: string): Promise<void> => {
		const tokenResponse = await this.myAuthData.youtubeApi.getToken(code);
		const youtubeToken = tokenResponse.tokens.access_token;
		this.myAuthData.youtubeToken = youtubeToken;
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
	extractSongsFromYouTube = async (item: K): Promise<Song> => {
		const url = "https://www.youtube.com/watch?v=";
		const videoId = item.snippet.resourceId.videoId;
		const video_url = url + videoId;

		const details = await ytdl.getBasicInfo(video_url);
		const filter = checkFullName(details);
		const track = normalizeString(filter.track);
		const artist = normalizeString(filter.artist);
		const song: Song = { track, artist };
		return song;
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
				return this.getTotalSongs(playlistId, newNextPageToken, totalSongs, songs);
			} else {
				return songs;
			}
		} catch (error) {
			// console.error(error);
			throw new Error("Failed to fetch playlist data");
		}
	};
}
