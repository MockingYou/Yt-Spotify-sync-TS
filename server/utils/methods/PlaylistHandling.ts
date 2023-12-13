import { Request, Response } from 'express';
import Spotify from "../../utils/spotify/Spotify";
import Youtube from "../../utils/youtube/Youtube";
import Song from "../interfaces/songs/Song";

async function createSpotifyPlaylist(playlistId: string, youtube: Youtube, spotify: Spotify, res: Response) {
    try {
        // Set SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const songs = await youtube.getPlaylistSongs(playlistId);
        const playlistTitle = await youtube.getPlaylistTitle(playlistId);
        const spotifyPlaylist = await spotify.createPlaylist(playlistTitle);

        for (const song of songs) {
            try {
                const songData: Song = await spotify.searchSong(song);
                const songName: string = await spotify.addSongToPlaylist(
                    spotifyPlaylist,
                    songData,
                );
                console.log(songName);
                res.write(`event: message\ndata: ${JSON.stringify({ songName })}\n\n`);
            } catch (error) {
                console.log(`Error processing song '${song}':`, error);
                res.write(`event: error\ndata: ${JSON.stringify({ error: `Error processing song '${song}': ${error}` })}\n\n`);
            }
        }

        res.end();
    } catch (error) {
        console.error(`Error converting playlist: ${error}`);
        res.write(`event: error\ndata: ${JSON.stringify({ error: `Error converting playlist: ${error}` })}\n\n`);
        res.end(); // Close the connection in case of an error
    }
}

export { createSpotifyPlaylist };
