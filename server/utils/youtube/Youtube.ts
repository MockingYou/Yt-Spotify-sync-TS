import { google, youtube_v3 } from "googleapis";
import dotenv from "dotenv";
import config from "../config.json";
import AuthData from "../interfaces/AuthData";
import Song from "../interfaces/songs/Song";
import Token, { createToken } from "../interfaces/tokens/Token";

import { checkFullName, normalizeString } from "../methods/FilterSongs";
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

      this.myAuthData.youtubeApi.setCredentials({ access_token: youtubeToken });

      // Set credentials on the 'youtube' instance
      this.youtube = google.youtube({
        version: 'v3',
        auth: this.myAuthData.youtubeApi,
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
      const response = await this.youtube.playlists.list({
        part: ["snippet"],
        id: [playlistId],
      } as youtube_v3.Params$Resource$Playlists$List);
  
      const playlist: K | undefined = response.data.items?.[0];
  
      if (playlist) {
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
  

  private async getVideoDetails(videoId: string): Promise<youtube_v3.Schema$Video> {
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
        throw new Error("Failed to fetch video details");
      }
    } catch (error) {
      console.error(`Error fetching video details for video ID ${videoId}:`, error);
      throw new Error("Failed to fetch video details");
    }
  }
  
  private async extractSongsFromYouTube(
    items: Array<youtube_v3.Schema$PlaylistItem>
  ): Promise<Array<Song>> {
    const songs: Array<Song> = [];
  
    for (let i = 0; i < items.length; i++) {
      const snippet = items[i].snippet;
      if (!snippet || !snippet.resourceId) {
        console.error("Invalid snippet or resourceId for item at index", i);
        continue;  // Skip to the next iteration
      }
  
      const videoId = snippet.resourceId.videoId;
  
      try {
        const details = await this.getVideoDetails(videoId as string);
        const filter = checkFullName(details.snippet);
        const track = normalizeString(filter.track);
        const artist = normalizeString(filter.artist);
        songs.push({ track, artist });
      } catch (error) {
        console.error("Error extracting songs from YouTube:", error);
      }
    }
  
    return songs;
  }

  public getPlaylistLength = async (playlistId: string): Promise<number> => {
    const response = await this.youtube.playlistItems.list({
        part:["snippet"],
        playlistId: playlistId,
    } as youtube_v3.Params$Resource$Playlistitems$List);
    console.log(response)
    return response.data.pageInfo?.totalResults as number
  } 

  public getPlaylistSongs = async (
    playlistId: string,
    nextPageToken: string | null = null,
    totalSongs: number = 0,
    songs: Array<Song> = [],
  ): Promise<K> => {
    try {
      const maxResults = 50;
      const response = await this.youtube.playlistItems.list({
        part: ["snippet"],
        playlistId: playlistId,
        maxResults: maxResults,
        pageToken: nextPageToken,
      } as youtube_v3.Params$Resource$Playlistitems$List);

      const { items, nextPageToken: newNextPageToken }  = response.data;
      if (!items) {
        console.error("Invalid response: items is undefined");
        return songs;
      }
      const info = await this.extractSongsFromYouTube(items as youtube_v3.Schema$PlaylistItem[]);
      songs.push(...info);
      totalSongs += items.length;

      if (newNextPageToken) {
        return this.getPlaylistSongs(
          playlistId,
          newNextPageToken,
          totalSongs,
          songs,
        );
      } else {
        return {
            songs: songs,
            playlistLength: totalSongs
        };
      }
    } catch (error) {
      console.error("Error fetching total songs:", error);
      throw new Error("Failed to fetch playlist data");
    }
  };

  public createPlaylist = async (
    playlistTitle: string,
  ): Promise<string> => {
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
    try {
      const query = `${song.artist} ${song.track}`;
    //   console.log("Search Query:", query);
  
      try {
        const searchResponse = await this.youtube.search.list({
          part: ["id"],
          q: query,
          maxResults: 1,
          type: ["video"], // Wrap "video" in an array
        } as youtube_v3.Params$Resource$Search$List);
  
        if(searchResponse.data.items && searchResponse.data.items.length > 0) {
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
    playlistId: string,
    song: Song,
  ): Promise<void> => {
    try {
      const videoId = await this.searchSong(song);
    //   console.log("Video ID:", videoId);

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
