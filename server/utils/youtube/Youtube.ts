import axios from "axios";
import { google, youtube_v3 } from "googleapis";
import ytdl from "ytdl-core";
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
  private ytUrl: string = "https://www.youtube.com/watch?v=";
  myAuthData: MyAuthData;
  private defaultToken: Token = createToken({});
  private youtube: ReturnType<typeof google.youtube>; 

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
      const tokenResponse = await this.myAuthData.youtubeApi.getToken(code);
      const youtubeToken = tokenResponse.tokens.access_token as string;
      console.log(`Successfully retrieved youtube access token.`);

      // Set credentials on the 'youtube' instance
      this.youtube = google.youtube({
        version: 'v3',
        auth: this.myAuthData.youtubeApi,
      });

      this.youtube = google.youtube({
        version: 'v3',
        auth: this.myAuthData.youtubeApiKey,
      });

      return (this.defaultToken = {
        access_token: youtubeToken,
        token_source: "youtube_token",
      });
    } catch (error) {
      console.error("Error retrieving youtube access token:", error);
      throw new Error("Failed to retrieve youtube access token");
    }
  };

  public getPlaylistTitle = async (playlistId: string): Promise<string> => {
    try {
      const url = `${this.baseApiUrl}/playlists?part=snippet&id=${playlistId}&key=${this.myAuthData.youtubeApiKey}`;
      const response = await axios.get(url);
      const playlist: K = response.data.items[0];

      return playlist.snippet.title;
    } catch (error) {
      console.log("Error fetching playlist title:", error);
      throw new Error("Failed to fetch playlist information");
    }
  };

  private extractSongsFromYouTube = async (
    item: Array<K>,
  ): Promise<Array<Song>> => {
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
        console.error("Error extracting songs from YouTube:", error);
      }
    }
    return songs;
  };

  public getTotalSongs = async (
    playlistId: string,
    nextPageToken: string | null = null,
    totalSongs: number = 0,
    songs: Array<Song> = [],
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
        return this.getTotalSongs(
          playlistId,
          newNextPageToken,
          totalSongs,
          songs,
        );
      } else {
        return songs;
      }
    } catch (error) {
      console.error("Error fetching total songs:", error);
      throw new Error("Failed to fetch playlist data");
    }
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
      throw error; // Rethrow the error to propagate it up
    }
  };

  public searchSong = async (song: Song): Promise<string> => {
    try {
      const query = `${song.artist} ${song.track}`;
      console.log("Search Query:", query);

      try {
        const searchResponse = await this.youtube.search.list({
          part: ["id"],
          q: query,
          maxResults: 1,
          type: "video",
        } as youtube_v3.Params$Resource$Playlists$Insert);

        if (
          searchResponse.data.items &&
          searchResponse.data.items.length > 0
        ) {
          song.id = searchResponse.data.items[0].id
            ?.videoId as string;
          if (song.id) {
            return song.id;
          }
        }
      } catch (error) {
        console.log(`Error searching for song: ${query}`, error);
        // You can handle the error here, e.g., return null or throw an error
      }

      console.log("No video found for the provided artist-song pair.");
      return song.id as string;
    } catch (error) {
      console.log("Search Error:", error);
      throw error;
    }
  };

  public addSongToPlaylist = async (
    song: Song,
    playlistId: string,
  ): Promise<void> => {
    try {
      const videoId = await this.searchSong(song);
      console.log("Video ID:", videoId);

      if (!videoId) {
        console.log(
          "No video found for the provided artist-song pair.",
        );
        return;
      }
      try {
        const response = await this.youtube.videos.insert({
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
          headers: {
            Authorization: `Bearer ${this.defaultToken.access_token}`, // Use oauthToken here
            "Content-Type": "application/json",
          },
        } as youtube_v3.Params$Resource$Videos$Insert);
        console.log(
          `Song with video ID ${videoId} added to playlist`,
          response.data,
        );
      } catch (error) {
        console.log(`Error adding video ${videoId} to playlist`, error);
        // You can handle the error here, e.g., skip the video or continue
      }
      console.log("Playlist created and video added successfully.");
    } catch (error) {
      console.log("Add Playlist Error:", error);
      throw error; // Rethrow the error to propagate it up
    }
  };
}
