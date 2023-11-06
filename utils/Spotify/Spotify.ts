import PlaylistAPI from "../PlaylistAPI";
import AuthData from "../AuthData"
import SpotifyWebApi from 'spotify-web-api-node';
import Song from '../songs/Song'
import { config } from "dotenv"

export default class Spotify {
    private spotifyApi: SpotifyWebApi

    constructor(authData: AuthData) {
      this.spotifyApi = new SpotifyWebApi({
        clientId: authData.oauthClient,
        accessToken: authData.oauthToken,
        redirectUri: authData.redirectUri
      });
    }

    async getAuthToken(code: string): Promise<string | Error> {
        try {
          const data = await this.spotifyApi.authorizationCodeGrant(code);
          const spotify_token = data.body['access_token'];
          const refresh_token = data.body['refresh_token'];
          const expires_in = data.body['expires_in'];
      
          this.spotifyApi.setAccessToken(spotify_token);
          this.spotifyApi.setRefreshToken(refresh_token);
      
          console.log(`Successfully retrieved access token. Expires in ${expires_in} s.`);
      
          setInterval(async () => {
            try {
              const tokenData = await this.spotifyApi.refreshAccessToken();
              const newAccessToken = tokenData.body['access_token'];
              console.log('The access token has been refreshed!');
              this.spotifyApi.setAccessToken(newAccessToken);
            } catch (refreshError) {
              console.error('Error refreshing access token:', refreshError);
            }
          }, (expires_in / 2) * 1000);
      
          return spotify_token;
        } catch (error) {
          console.error('Error getting tokens:', error);
          throw error;
        }
      }
      
    getPlaylistTitle = async (playlistId: string): Promise<string> => {
        try {
            const playlist = await this.spotifyApi.getPlaylist(playlistId);
            const playlistTitle = playlist.body.name;
            return playlistTitle;
        } catch (error: any) {
            console.error('Error fetching playlist title:', error.message);
            throw error;
        }
    }

    createPlaylist = async (playlistTitle: string): Promise<String> => {
        try {
            const playlistData = await this.spotifyApi.createPlaylist(playlistTitle, { 'description': 'Youtube Playlist', 'public': true });
            const spotifyPlaylistId = playlistData.body.id;
            console.log('Created playlist with ID:', spotifyPlaylistId);
            return spotifyPlaylistId; // Return the playlist ID if needed
        } catch (error) {
            console.log('Failed to create or retrieve playlist', error);
            throw error;
        }
    }
    
    searchSongs = async (song: Song): Promise<string> => {
        try {
            const songs = await this.spotifyApi.searchTracks(`${song.track} ${song.artist}`)
            // console.log(`Search tracks by "${track}" in the track name and "${artist}" in the artist name`);
            let trackId = `spotify:track:${songs.body.tracks?.items[0].id}`
            return trackId;
        } catch (error) {
            console.log('Something went wrong!', error);
            throw error;
        }
    }

    addSongsToPlaylist = async(playlistId: string, songs: string[]): Promise<void> => {
        try {
            const maxSongsPerRequest = 100;
            const batches = [];
            for (let i = 0; i < songs.length; i += maxSongsPerRequest) {
              batches.push(songs.slice(i, i + maxSongsPerRequest));
            }
            for (const batch of batches) {
              this.spotifyApi.addTracksToPlaylist(playlistId, batch)
              console.log('Added songs to playlist!');
            }
        } catch (error) {
            console.log('Something went wrong!', error);
            throw error;
        }
    }
    async getPlaylistSongs(playlistId: string): Promise<Song[] | Error> {
        try {
          const allSongs: Song[] = [];
          const maxResults = 100;
          let offset = 0;
          let hasSongs = true; // Set initially to true to start the loop
          const playlistTracks = await this.spotifyApi.getPlaylistTracks(playlistId, {
            fields: 'total',
          });
          const playlistLength = playlistTracks.body.total;
    
          do {
            const playlistTracksData = await this.spotifyApi.getPlaylistTracks(playlistId, {
              offset,
              limit: maxResults,
              fields: 'items(track(name,artists(name)))',
            });
    
            const playlistItems = playlistTracksData.body.items;
    
            const songs: Song[] = playlistItems.map(item => ({
              artist: item.track?.artists[0].name || 'Unknown Artist',
              track: item.track?.name || 'Unknown Track',
            }));
    
            allSongs.push(...songs);
    
            if (offset >= playlistLength) {
              hasSongs = false;
            } else {
              offset += maxResults;
            }
          } while (hasSongs);
    
          return allSongs;
        } catch (error) {
          console.error('Error getting playlist songs:', error);
          throw error;
        }
      }

}