import Spotify from "../utils/spotify/Spotify";
import Youtube from "../utils/youtube/Youtube";
import Token from "../utils/interfaces/tokens/Token";
import { createSpotifyPlaylist } from "../utils/methods/playlistHandling";
import { authenticateToken } from "../middleware/authMiddleware";
import { Request, Response } from "express";

import { Router } from "express";
import jwt from "jsonwebtoken";


const router = Router();

const jwtSecret = process.env.JWT_SECRET!;

const spotify = new Spotify();
const youtube = new Youtube();

//  ================== Spotify APIs ======================

router.get(
	"/spotify/playlists",
	authenticateToken,
	async (req: Request, res: Response) => {
		try {
			const token = req.headers.authorization?.split(" ")[1];
			if (!token) {
				return res
					.status(401)
					.json({ error: "Authorization token is required" });
			}
			const decoded = jwt.verify(token, jwtSecret) as {
				token: Token;
				user: { id: string };
			};
			const spotifyToken = decoded.token.access_token;
			spotify.myAuthData.spotifyApi.setAccessToken(spotifyToken);

			const userData = await spotify.myAuthData.spotifyApi.getMe();
			const userId = userData.body.id;
			const limit = 50;
			const playlistsData =	
				await spotify.myAuthData.spotifyApi.getUserPlaylists(userId, {
					limit,
				});
			const playlists = playlistsData.body.items.map((playlist) => ({
				id: playlist.id,
				name: playlist.name,
				images: playlist.images,
			}));
			res.status(200).json(playlists);
		} catch (error: any) {
			console.error("Error fetching Spotify playlists:", error);
			if (error.statusCode === 429) {
				const resetTime =
					error.headers["retry-after"] ||
					error.headers["x-ratelimit-reset"];
				console.log(
					`Rate limit exceeded. Retry after ${resetTime} seconds.`,
				);
			} else {
				res.status(500).json({
					error: `Error fetching Spotify playlists: ${error.message}`,
				});
			}
		}
	},
);

router.get(
	"/spotify/playlist-title/:playlistId",
	async (req: Request, res: Response) => {
		try {
			const playlistId: string = req.params.playlistId;
			const playlistData = await spotify.getPlaylistData(playlistId);
			// const title = playlistData.title;
			res.json(playlistData);
		} catch (error) {
			// console.error();
			res.status(500).json({
				error: `Error fetching playlist title: ${error}`,
			});
		}
	},
);

router.get(
	"/spotify/playlist-songs/:playlistId",
	async (req: Request, res: Response) => {
		try {
			const playlistId: string = req.params.playlistId;
			const songs = await spotify.getPlaylistSongs(playlistId);
			res.json(songs);
		} catch (error: any) {
			res.status(500).json({
				error: `Error fetching playlist songs: ${error}`,
			});
		}
	},
);

router.get(
	"/spotify/add-songs/:playlistId",
	async (req: Request, res: Response) => {
		try {
			const ytPlaylistId = req.params.playlistId;
			res.writeHead(200, {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			});
			await createSpotifyPlaylist(ytPlaylistId, youtube, spotify, res);
		} catch (error) {
			console.error(`Error converting playlist: ${error}`);
			res.status(500).json({ error: "Internal Server Error" });
		}
	},
);

//  ================== Spotify APIs ======================

//  ================== Google APIs ======================

router.get("/google/protected", (req: Request, res: Response) => {
	if (!youtube.myAuthData.token) {
		res.redirect("/auth");
	} else {
		res.send("Welcome to the protected route!");
	}
});

router.get(
	"/youtube/playlists",
	authenticateToken,
	async (req: Request, res: Response) => {
		const token = req.headers.authorization?.split(" ")[1];
		if (!token) {
			return res
				.status(401)
				.json({ error: "Authorization token is required" });
		}
		const decoded = jwt.verify(token, jwtSecret) as {
			token: Token;
			user: { id: string };
		};
		const youtubeToken = decoded.token;
		youtube.myAuthData.youtubeApi.setCredentials({
			access_token: youtubeToken.access_token,
			refresh_token: youtubeToken.refresh_token,
		});
		const playlists = await youtube.getYouTubePlaylists();
		res.json(playlists);
	},
);

router.get(
	"/youtube/get-length/:playlistId",
	async (req: Request, res: Response) => {
		const playlistId = req.params.playlistId;
		const response = await youtube.getPlaylistLength(playlistId);
		res.json(response);
	},
);

router.get(
	"/youtube/playlist-songs/:playlistId",
	async (req: Request, res: Response) => {
		try {
			const playlistId: string = req.params.playlistId;
			let totalSongs = 0;
			let nextPageToken: string | null = null;
			let songsArray: any = [];
			do {
				const { items, nextPageToken: newNextPageToken } =
					await youtube.getPlaylistSongs(playlistId, nextPageToken);

				if (!items) {
					console.error("Invalid response: items is undefined");
					return;
				}
				for (const item of items) {
					try {
						const song = await youtube.extractSongsFromYouTube(
							item,
						);
						songsArray.push(song);
					} catch (error) {
						console.error(
							`Error processing song '${item}':`,
							error,
						);
					}
				}
				totalSongs += items.length;
				nextPageToken = newNextPageToken as string;
			} while (nextPageToken);
			res.json(songsArray);
		} catch (error: any) {
			res.status(500).json({
				error: `Error fetching playlist songs: ${error}`,
			});
		}
	},
);

router.post(
	"/youtube/add-songs/:playlistId",
	async (req: Request, res: Response) => {
		try {
			const spotifyPlaylistId: string = req.params.playlistId;
			const songs = await spotify.getPlaylistSongs(spotifyPlaylistId);
			const playlistData = await spotify.getPlaylistData(
				spotifyPlaylistId,
			);
			const youtubePlaylistId = await youtube.createPlaylist("");
			for (const song of songs) {
				try {
					await youtube.addSongToPlaylist(youtubePlaylistId, song);
				} catch (error) {
					console.error(`Error processing song '${song}':`, error);
				}
				console.log(
					"Request Payload:",
					JSON.stringify({
						snippet: {
							playlistId: youtubePlaylistId,
							resourceId: {
								kind: "youtube#video",
								videoId: song,
							},
						},
					}),
				);
			}

			res.status(200).json({ message: "Playlist created successfully" });
		} catch (error: any) {
			console.error(`Error converting playlist: ${error.response.data}`);
			res.status(500).json({ error: "Internal Server Error" });
		}
	},
);
//  ================== Google APIs ======================

export default router;
