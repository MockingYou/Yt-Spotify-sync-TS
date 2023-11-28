import express, { Request, Response, Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import config from "./utils/config.json";
import Spotify from "./utils/spotify/Spotify";
import Youtube from "./utils/youtube/Youtube";
import {
  loadTokensFromLocalStorage,
  saveTokensToLocalStorage,
} from "./utils/methods/LoginHandler";
import AuthData from "./utils/AuthData";
dotenv.config();
const app: Application = express();
const port = process.env.PORT || 8000;
const spotify_scopes = config.spotify.scopes;

const spotify = new Spotify();
const youtube = new Youtube();

// const savedSpotifyToken = loadTokensFromLocalStorage("spotify_token");
// const savedYoutubeToken = loadTokensFromLocalStorage("youtube_token");

// if (savedSpotifyToken) {
//     // Set the tokens in your Spotify instance
//     spotify.isLogged = true;
// }

// if (savedYoutubeToken) {
//     // Set the tokens in your Spotify instance
//     youtube.isLogged = true;
// }
app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Replace with your frontend domain
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
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
//  ================== Spotify APIs ======================
app.get("/spotify/login", (req, res) => {
  res.redirect(
    spotify.myAuthData.spotifyApi.createAuthorizeURL(spotify_scopes, "")
  );
});

app.get("/spotify/callback", async (req, res) => {
  const code: any = req.query.code;
  try {
    await spotify.getAuthToken(code);
    // saveTokensToLocalStorage(token);
    const successScript = `
		<script>
			window.opener.postMessage('Success! You can now close the window.', '*');
		</script>
	`;
    res.send(successScript);
  } catch (error) {
    console.error("Error getting tokens:", error);
    res.status(500).json({ error: `Error getting tokens: ${error}` });
  }
});

app.get("/api/spotify/playlistTitle/:playlistId", async (req, res) => {
  try {
    const playlistId: string = req.params.playlistId;
    const title: string = await spotify.getPlaylistTitle(playlistId);
    res.json(title);
  } catch (error) {
    // console.error();
    res.status(500).json({ error: `Error fetching playlist title: ${error}` });
  }
});

app.get("/api/spotify/playlist/:playlistId", async (req, res) => {
  try {
    const playlistId: string = req.params.playlistId;
    const songs = await spotify.getPlaylistSongs(playlistId);
    res.json(songs);
  } catch (error: any) {
    console.error("Error fetching playlist title:", error.message);
    throw error;
  }
});

app.post("/api/spotify/create-playlist", async (req, res) => {
  try {
    const playlistId = await spotify.createPlaylist("Marcel Te Vede");
    res.json(playlistId);
  } catch (error) {
    console.log("Failed to create or retrieve playlist", error);
    throw error;
  }
});

app.post("/api/spotify/add-songs/:playlistId", async (req, res) => {
  try {
    const ytPlaylistId: string = req.params.playlistId;
    const songs = await youtube.getTotalSongs(ytPlaylistId);
    const playlistTitle = await youtube.getPlaylistTitle(ytPlaylistId);
    const spotifyPlaylist = await spotify.createPlaylist(playlistTitle);
    for (const song of songs) {
      try {
        const trackName = await spotify.searchSong(song);
        await spotify.addSongToPlaylist(spotifyPlaylist, trackName);
      } catch (error) {
        console.log(`Error processing song '${song}':`, error);
      }
    }
    // Respond with success
    res.status(200).json({ message: "Playlist created successfully" });
  } catch (error) {
    // Log and respond with an error
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
    // saveTokensToLocalStorage(token);
    const successScript = `
		<script>
			window.opener.postMessage('Success! You can now close the window.', '*');
		</script>
	`;
    res.send(successScript);
  } catch (err) {
    console.error("Error exchanging code for token:", err);
    res.status(500).send("Error");
  }
});

app.get("/google/protected", (req, res) => {
  //   if (!youtube.myAuthData.youtubeToken) {
  //       res.redirect("/auth");
  //   } else {
  //       res.send("Welcome to the protected route!");
  //   }
});

// GET endpoint to list all songs in a YouTube playlist
app.get("/api/youtube/playlist/:playlistId", async (req, res) => {
  try {
    const playlistId = req.params.playlistId;
    const songs = await youtube.getTotalSongs(playlistId);
    res.json(songs);
  } catch (error) {
    console.error("Error fetching playlist:", error);
    res.status(500).json({ error: "Failed to fetch playlist" });
  }
});

//  ================== Google APIs ======================

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});
