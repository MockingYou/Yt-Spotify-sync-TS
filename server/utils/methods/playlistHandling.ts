import { Request, Response } from "express";
import Spotify from "../spotify/Spotify";
import Youtube from "../youtube/Youtube";
import Song from "../interfaces/songs/Song";

async function createSpotifyPlaylist(
	playlistId: string,
	youtube: Youtube,
	spotify: Spotify,
	res: Response,
	nextPageToken: string | null = null,
	totalSongs: number = 0,
) {
	try {
		const playlistTitle = await youtube.getPlaylistData(playlistId);
		const spotifyPlaylist = await spotify.createPlaylist(playlistTitle);
		do {
			const { items, nextPageToken: newNextPageToken } = await youtube.getPlaylistSongs(playlistId, nextPageToken);

			if (!items) {
				console.error("Invalid response: items is undefined");
				return;
			}
			for (const item of items) {
				try {
					const song = await youtube.extractSongsFromYouTube(item);
					const songData: Song = await spotify.searchSong(song);
					const songName: string = await spotify.addSongToPlaylist(
						spotifyPlaylist,
						songData,
					);
					const data = { message: songName };
					console.log(`sent: ${data.message}`);
					res.write(`data: ${JSON.stringify(data)}\n\n`);
				} catch (error) {
					console.log(`Error processing song '${item}':`, error);
					res.write(
						`event: error\ndata: ${JSON.stringify({
							error: `Error processing song '${item}': ${error}`,
						})}\n\n`,
					);
				}
			}
			totalSongs += items.length;
			nextPageToken = newNextPageToken as string;
		} while (nextPageToken);

		const date2 = Date.now();

	} catch (error) {
		console.error(`Error converting playlist: ${error}`);
		res.write(
			`event: error\ndata: ${JSON.stringify({
				error: `Error converting playlist: ${error}`,
			})}\n\n`,
		);
	}
}

export { createSpotifyPlaylist };
