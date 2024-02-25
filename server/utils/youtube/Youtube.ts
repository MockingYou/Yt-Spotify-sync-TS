import { google, youtube_v3 } from "googleapis";
import dotenv from "dotenv";
import config from "../config.json";
import AuthData from "../interfaces/AuthData";
import Song from "../interfaces/songs/Song";
import Token, { createToken } from "../interfaces/tokens/Token";

import { checkFullName, normalizeString } from "../methods/filterSongs";
dotenv.config();

type MyAuthData = Omit<AuthData, "spotifyApi" | "spotifyToken">;
type K = { [key: string]: any };

export default class Youtube {
	public isLogged: boolean = false;
	private baseApiUrl: string = "https://www.googleapis.com/youtube/v3";
	private youtube: ReturnType<typeof google.youtube>;
	myAuthData: MyAuthData;
	private defaultToken: Token = createToken({});

	constructor() {
		this.myAuthData = {
			clientId: process.env.CLIENT_ID_YOUTUBE || "",
			clientSecret: process.env.CLIENT_SECRET_YOUTUBE || "",
			token: this.defaultToken,
			redirectUri: config.google.redirect_uris[0],
			youtubeApiKey: process.env.YOUTUBE_API_KEY || "",
			youtubeApi: new google.auth.OAuth2(),
		};
		this.myAuthData.youtubeApi = new google.auth.OAuth2(
			this.myAuthData.clientId,
			this.myAuthData.clientSecret,
			this.myAuthData.redirectUri,
		);
		this.youtube = google.youtube({
			version: "v3",
			auth: this.myAuthData.youtubeApi,
		});
	}

	public generateAuthUrl = (): string => {
		return this.myAuthData.youtubeApi.generateAuthUrl({
			access_type: "offline",
			scope: config.google.scopes,
		});
	};

	public getAuthToken = async (code: string): Promise<Token> => {
		try {
			const tokenResponse = await this.myAuthData.youtubeApi.getToken(
				code,
			);
			const youtubeToken = tokenResponse.tokens.access_token as string;
			console.log(`Successfully retrieved YouTube access token.`);
			this.myAuthData.youtubeApi.setCredentials({
				access_token: youtubeToken,
			});
			this.youtube = google.youtube({
				version: "v3",
				auth: this.myAuthData.youtubeApi,
			});
			this.myAuthData.token = {
				access_token: youtubeToken,
				token_source: "youtube_token",
			};
			return this.myAuthData.token;
		} catch (error) {
			console.error("Error retrieving YouTube access token:", error);
			throw new Error("Failed to retrieve YouTube access token");
		}
	};

	public getChannelId = async (): Promise<string | null> => {
		try {
			const channelsResponse = await this.youtube.channels.list({
				part: ["id"],
				mine: true,
			});
			const items = channelsResponse.data.items;
			if (items && items.length > 0) {
				const channelId = items[0].id;
				console.log("Channel ID:", channelId);
				return channelId as string;
			} else {
				console.error("No channels found for the authenticated user.");
				return null;
			}
		} catch (error) {
			console.error("Error getting channel id:", error);
			return null;
		}
	};

	public getYouTubePlaylists = async () => {
		try {
			const channelId = await this.getChannelId();
			if (!channelId) {
				// Handle the case where channelId is null
				console.error("Unable to fetch playlists. Channel ID is null.");
				return null;
			}

			const playlistsResponse = await this.youtube.playlists.list({
				part: ["snippet"],
				channelId: channelId,
			});

			const playlists = playlistsResponse.data.items?.map((playlist) => ({
				id: playlist.id,
				name: playlist.snippet?.title,
				images: playlist.snippet?.thumbnails?.default?.url,
			}));
			console.log("YouTube Playlists:", playlists);
			return playlists;
		} catch (error: any) {
			console.error("Error fetching YouTube playlists:", error.message);
			throw error;
		}
	};
	public getPlaylistData = async (playlistId: string): Promise<string> => {
		try {
			const response = await this.youtube.playlists.list({
				part: ["snippet"],
				id: [playlistId],
			} as youtube_v3.Params$Resource$Playlists$List);
			const playlist: K | undefined = response.data.items?.[0];
			if (playlist) {
				console.log(playlist.snippet)
				return playlist.snippet.title;
			} else {
				console.log("Playlist not found or has no items.");
				throw new Error("Failed to fetch playlist information");
			}
		} catch (error) {
			console.log("Error fetching playlist title:", error);
			throw new Error("Failed to fetch playlist information");
		}
	};

	private async getVideoDetails(
		videoId: string,
	): Promise<youtube_v3.Schema$Video | string> {
		try {
			const response = await this.youtube.videos.list({
				part: ["snippet"],
				id: [videoId],
			} as youtube_v3.Params$Resource$Videos$List);

			const videoDetails = response.data.items?.[0];

			if (videoDetails) {
				return videoDetails;
			} else {
				console.log(`Video details not found for video ID: ${videoId}`);
				return "Video details not found for video ID";
			}
		} catch (error) {
			console.error(
				`Error fetching video details for video ID ${videoId}:`,
				error,
			);
			throw new Error("Failed to fetch video details");
		}
	}

	public async extractSongsFromYouTube(
		item: youtube_v3.Schema$PlaylistItem,
	): Promise<Song> {
		let song: Song = { track: "", artist: "", image: "" };
		const snippet = item.snippet;
		const videoId = snippet?.resourceId?.videoId;
		try {
			const details = await this.getVideoDetails(videoId as string);
			const filter =
				typeof details == "string"
					? details
					: checkFullName(details.snippet);
			const track =
				typeof filter == "string"
					? "Failed to search for video"
					: normalizeString(filter.track);
			const artist =
				typeof filter == "string"
					? `${snippet?.title}`
					: normalizeString(filter.artist);
			const image = snippet?.thumbnails?.default?.url
			song = { track, artist, image };
		} catch (error) {
			console.error("Error extracting songs from YouTube:", error);
		}
		return song;
	}

	public getPlaylistLength = async (playlistId: string): Promise<number> => {
		const response = await this.youtube.playlistItems.list({
			part: ["snippet"],
			playlistId: playlistId,
		} as youtube_v3.Params$Resource$Playlistitems$List);
		return response.data.pageInfo?.totalResults as number;
	};

	public getPlaylistSongs = async (
		playlistId: string,
		nextPageToken: string | null = null,
		totalSongs: number = 0,
	): Promise<K> => {
		const maxResults = 50;
		const response = await this.youtube.playlistItems.list({
			part: ["snippet"],
			playlistId: playlistId,
			maxResults: maxResults,
			pageToken: nextPageToken,
		} as youtube_v3.Params$Resource$Playlistitems$List);
		return response.data;
	};

	public createPlaylist = async (playlistTitle: string): Promise<string> => {
		try {
			if (!this.defaultToken.access_token) {
				return "Unauthorized";
			}
			const playlistDescription =
				"This is a new playlist created via the API";
			const response = await this.youtube.playlists.insert({
				part: ["snippet"],
				requestBody: {
					snippet: {
						title: playlistTitle,
						description: playlistDescription,
					},
				},
			} as youtube_v3.Params$Resource$Playlists$Insert);

			if (response.status !== 200) {
				return `Error creating playlist. Status: ${response.status}`;
			}
			console.log("New playlist created:", response.data);
			return response.data.id as string;
		} catch (error) {
			console.error("Error creating playlist:", error);
			throw error;
		}
	};

	public searchSong = async (song: Song): Promise<string> => {
		const query = `${song.artist} ${song.track}`;
		try {
			const searchResponse = await this.youtube.search.list({
				part: ["id"],
				q: query,
				maxResults: 1,
				type: ["video"], // Wrap "video" in an array
			} as youtube_v3.Params$Resource$Search$List);

			if (
				searchResponse.data.items &&
				searchResponse.data.items.length > 0
			) {
				song.id = searchResponse.data.items[0].id?.videoId as string;
				if (song.id) {
					return song.id;
				}
			}
		} catch (error) {
			console.log(`Error searching for song: ${query}`, error);
		}
		console.log("No video found for the provided artist-song pair.");
		return song.id as string;
	};

	public addSongToPlaylist = async (
		playlistId: string,
		song: Song,
	): Promise<void> => {
		try {
			const videoId = await this.searchSong(song);
			if (!videoId) {
				console.log(
					"No video found for the provided artist-song pair.",
				);
				return;
			}

			const response = await this.youtube.playlistItems.insert({
				part: ["snippet"],
				requestBody: {
					snippet: {
						playlistId: playlistId,
						resourceId: {
							kind: "youtube#video",
							videoId: videoId,
						},
					},
				},
			} as youtube_v3.Params$Resource$Playlistitems$Insert);

			console.log(
				`Song with video ID ${videoId} added to playlist`,
				response.data,
			);
		} catch (error) {
			console.log("Add Playlist Error:", error);
			throw error;
		}
	};
}
