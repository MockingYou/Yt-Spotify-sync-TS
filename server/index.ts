import express, { Request, Response, Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import config from "./utils/config.json";
import Spotify from "./utils/spotify/Spotify";
import Youtube from "./utils/youtube/Youtube";
import { createSpotifyPlaylist, getAllPlaylistSongs } from "./utils/methods/playlistHandling";
import { generateRandomKey } from "./utils/methods/generateRandomKey";
import jwt from "jsonwebtoken";
import AuthData from "./utils/interfaces/AuthData";
dotenv.config();
const app: Application = express();
const port = process.env.PORT || 8000;
const spotify_scopes = config.spotify.scopes;

const spotify = new Spotify();
const youtube = new Youtube();

const corsOptions = {
    origin: 'http://localhost:5173', // Update with your React app's origin
};

app.use(cors(corsOptions));
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "http://localhost:5173");
	res.header(
		"Access-Control-Allow-Methods",
		"GET, POST, OPTIONS, PUT, PATCH, DELETE",
	);
	res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
	res.header("Access-Control-Allow-Credentials", "true");

	// Allow preflight requests
	if (req.method === "OPTIONS") {
		res.sendStatus(200);
	} else {
		next();
	}
});

app.get("/events",cors(corsOptions), (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    })
    setInterval(() => {
        const data = {message: `Hello: (${new Date().toISOString()})`}
        console.log(`sent: ${data}`)
        res.write(`data: ${JSON.stringify(data)}\n\n`)
    }, 1000)
})

//  ================== Spotify APIs ======================
app.get("/spotify/login", (req, res) => {
	res.redirect(
		spotify.myAuthData.spotifyApi.createAuthorizeURL(spotify_scopes, ""),
	);
});

app.get("/spotify/callback", async (req, res) => {
	const code: any = req.query.code;
	try {
	  await spotify.getAuthToken(code);
	  const successScript = `
		<script>
		  window.opener.postMessage('Success! You can now close the window.', '*');
		</script>`;
	  res.send(successScript);
	} catch (error) {
	  console.error("Error getting tokens:", error);
	  res.status(500).json({ error: `Error getting tokens: ${error}` });
	}
  });


  app.get("/api/spotify/playlists", async (req, res) => {
	try {
	  const userData = await spotify.myAuthData.spotifyApi.getMe();
	  const userId = userData.body.id;
	  const limit = 50;
	  const playlistsData = await spotify.myAuthData.spotifyApi.getUserPlaylists(userId, { limit });
	  const playlists = playlistsData.body.items.map(playlist => ({
		id: playlist.id,
		name: playlist.name,
		images: playlist.images
	  }));
	  res.json(playlists);
	} catch (error: any) {
	  console.error("Error fetching Spotify playlists:", error);
	  if (error.statusCode === 429) {
		const resetTime = error.headers['retry-after'] || error.headers['x-ratelimit-reset'];
		console.log(`Rate limit exceeded. Retry after ${resetTime} seconds.`);
	  } else {
		res.status(500).json({ error: `Error fetching Spotify playlists: ${error.message}` });
	  }
	}
  });
  

app.get("/api/spotify/playlistTitle/:playlistId", async (req, res) => {
	try {
		const playlistId: string = req.params.playlistId;
		const title: string = await spotify.getPlaylistTitle(playlistId);
		res.json(title);
	} catch (error) {
		// console.error();
		res.status(500).json({
			error: `Error fetching playlist title: ${error}`,
		});
	}
});

app.get("/api/spotify/playlist-songs/:playlistId", async (req, res) => {
	try {
		const playlistId: string = req.params.playlistId;
		const songs = await spotify.getPlaylistSongs(playlistId);
		res.json(songs);
	} catch (error: any) {
		res.status(500).json({
			error: `Error fetching playlist songs: ${error}`,
		});
	}
});

app.get("/api/spotify/add-songs/:playlistId", cors(corsOptions), async (req, res) => {
    try {
        const ytPlaylistId = req.params.playlistId;
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        })
        await createSpotifyPlaylist(ytPlaylistId, youtube, spotify, res);
    } catch (error) {
        console.error(`Error converting playlist: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//  ================== Spotify APIs ======================

//  ================== Google APIs ======================

app.get("/google/login", (req, res) => {
	const authUrl: string = youtube.generateAuthUrl();
	res.redirect(authUrl);
});

app.get("/google/callback", async (req, res) => {
	const code: any = req.query.code;
	try {
		await youtube.getAuthToken(code);
		const successScript = `
			<script>
				window.opener.postMessage('Success! You can now close the window.', '*');
			</script>
		`;
		res.send(successScript);
	} catch (error) {
		console.error("Error exchanging code for token:", error);
		res.status(500).json({ error: `Error getting tokens: ${error}` });
	}
});

app.get("/google/protected", (req, res) => {
	//   if (!youtube.myAuthData.youtubeToken) {
	//       res.redirect("/auth");
	//   } else {
	//       res.send("Welcome to the protected route!");
	//   }
});

app.get("/api/youtube/playlists", async (req, res) => {
	const playlists = await youtube.getYouTubePlaylists();
	res.json(playlists)
})

app.get("/api/youtube/get-length/:playlistId", async (req, res) => {
    const playlistId = req.params.playlistId
    const response = await youtube.getPlaylistLength(playlistId)
    res.json(response)
})

app.get("/api/youtube/playlist-songs/:playlistId", async (req, res) => {
	try {
		const playlistId: string = req.params.playlistId;
		let songsArray = getAllPlaylistSongs(playlistId, youtube)
		res.json(songsArray);
	} catch (error: any) {
		res.status(500).json({
			error: `Error fetching playlist songs: ${error}`,
		});
	}
});

app.post("/api/youtube/add-songs/:playlistId", async (req, res) => {
	try {
		const spotifyPlaylistId: string = req.params.playlistId;
		const songs = await spotify.getPlaylistSongs(spotifyPlaylistId);
		console.log(songs)
		const playlistTitle = await spotify.getPlaylistTitle(spotifyPlaylistId);
		console.log(playlistTitle)
		const youtubePlaylistId = await youtube.createPlaylist(playlistTitle);
		console.log(youtubePlaylistId)
		for(const song of songs) {
			console.log(song)
			try {
				await youtube.addSongToPlaylist(youtubePlaylistId, song)
			} catch (error) {
				console.log(`Error processing song '${song}':`, error);
			}
			console.log('Request Payload:', JSON.stringify({ snippet: { playlistId: youtubePlaylistId, resourceId: { kind: 'youtube#video', videoId: song } } }));
		}

		res.status(200).json({ message: "Playlist created successfully" });
	} catch (error: any) {
		console.error(`Error converting playlist: ${error.response.data}`);
		res.status(500).json({ error: "Internal Server Error" });
	}
})
//  ================== Google APIs ======================

app.listen(port, () => {
	console.log(`Server is Fire at http://localhost:${port}`);
});
