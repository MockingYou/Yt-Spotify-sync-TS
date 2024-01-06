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
		const date1 = Date.now();
		const playlistTitle = await youtube.getPlaylistTitle(playlistId);
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
            console.log(nextPageToken)
		} while (nextPageToken);

		const date2 = Date.now();
		console.log("=============================================");
		console.log("Date: ", date2 - date1);
		console.log("=============================================");
	} catch (error) {
		console.error(`Error converting playlist: ${error}`);
		res.write(
			`event: error\ndata: ${JSON.stringify({
				error: `Error converting playlist: ${error}`,
			})}\n\n`,
		);
	}
}

async function getAllPlaylistSongs(playlistId: string, youtube: Youtube): Promise<any[]> {
	let totalSongs = 0;
	let nextPageToken: string | null = null;
	let songsArray: any[] = [];
  
	do {
	  const { items, nextPageToken: newNextPageToken } = await youtube.getPlaylistSongs(playlistId, nextPageToken);
  
	  if (!items) {
		console.error("Invalid response: items is undefined");
		return songsArray;
	  }
  
	  for (const item of items) {
		try {
		  const song = await youtube.extractSongsFromYouTube(item);
		  songsArray.push(song);
		} catch (error) {
		  console.log(`Error processing song '${item}':`, error);
		}
	  }
  
	  totalSongs += items.length;
	  nextPageToken = newNextPageToken as string;
	  console.log(nextPageToken);
	} while (nextPageToken);
  
	return songsArray;
  }

export { createSpotifyPlaylist, getAllPlaylistSongs };
