import { Request, Response } from 'express';
import Spotify from "../spotify/Spotify";
import Youtube from "../youtube/Youtube";
import Song from "../interfaces/songs/Song";

async function createSpotifyPlaylist(playlistId: string, youtube: Youtube, spotify: Spotify, res: Response) {
    try {
        
        const playlistTitle = await youtube.getPlaylistTitle(playlistId);
        const spotifyPlaylist = await spotify.createPlaylist(playlistTitle);
        const songs = await youtube.getPlaylistSongs(playlistId);
        for (const song of songs.songs) {
            try {
                const songData: Song = await spotify.searchSong(song);
                const songName: string = await spotify.addSongToPlaylist(
                    spotifyPlaylist,
                    songData,
                );
                // console.log(songName);
                // res.write(`event: message\ndata: ${JSON.stringify({ songName })}\n\n`);
                const data = {message: `Song name: (${songName})`}
                console.log(`sent: ${data.message}`)
                res.write(`data: ${JSON.stringify(data)}\n\n`)

            } catch (error) {
                console.log(`Error processing song '${song}':`, error);
                res.write(`event: error\ndata: ${JSON.stringify({ error: `Error processing song '${song}': ${error}` })}\n\n`);
            }
        }
    } catch (error) {
        console.error(`Error converting playlist: ${error}`);
        res.write(`event: error\ndata: ${JSON.stringify({ error: `Error converting playlist: ${error}` })}\n\n`);
    }
}

export { createSpotifyPlaylist };
