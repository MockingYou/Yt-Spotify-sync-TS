import { Router } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { authenticateToken } from "../middleware/authMiddleware";
import { loginHandler } from "../utils/methods/loginHandler";
import Spotify from "../utils/spotify/Spotify";
import Youtube from "../utils/youtube/Youtube";
import config from "../utils/config.json";
import { triggerLogout } from "../middleware/authMiddleware";

const spotify_scopes = config.spotify.scopes;
const jwtSecret = process.env.JWT_SECRET!;

dotenv.config();

const router = Router();

const spotifyAuth = new Spotify();
const googleAuth = new Youtube();

router.get("/auth/google", (req, res) => {
	const url = googleAuth.generateAuthUrl();
	res.redirect(url);
});

router.get("/auth/google/callback", async (req, res) => {
	const code = req.query.code as string;
	try {
		const { token, user } = await googleAuth.getAuthToken(code);
		const jwtToken = jwt.sign({ token, user }, jwtSecret, {
			expiresIn: "1h",
		});
		const escapedUsername = user.username.replace(/'/g, "\\'");
		const escapedEmail = user.email.replace(/'/g, "\\'");
		const escapedImage = user.image.replace(/'/g, "\\'");
		res.cookie("YoutubeToken", jwtToken, {
			httpOnly: false,
			maxAge: 10000,
			sameSite: "strict",
			expires: new Date(new Date().getTime() + 10000),
		});
		res.send(`
		<script>
		  window.opener.postMessage({
			success: true,
			token: '${jwtToken}',
			username: '${escapedUsername}',
			email: '${escapedEmail}',
			image: '${escapedImage}',
			message: 'Success! You can now close the window.'
		  }, '*');
		  window.close();
		</script>
	  `);
	} catch (error: any) {
		// Handle errors properly
		console.error("Error during Google authentication:", error);
		res.send(`
			<script>
				window.opener.postMessage({
					success: false,
					message: '${error.message}'
				}, '*');
				window.close();
			</script>
		`);
	}
});

router.get("/auth/spotify", (req, res) => {
	res.redirect(
		spotifyAuth.myAuthData.spotifyApi.createAuthorizeURL(
			spotify_scopes,
			"",
		),
	);
});

router.get("/auth/spotify/callback", async (req, res) => {
	const code = req.query.code as string;
	try {
		const { token, user } = await spotifyAuth.getAuthToken(code);
		const jwtToken = jwt.sign({ token, user }, jwtSecret, {
			expiresIn: "1h",
		});
		const escapedUsername = user.username.replace(/'/g, "\\'");
		const escapedEmail = user.email.replace(/'/g, "\\'");
		const escapedImage = user.image.replace(/'/g, "\\'");
		res.cookie("SpotifyToken", jwtToken, {
			httpOnly: false,
			maxAge: 60 * 60 * 1000,
			sameSite: "strict",
		});
		res.send(`
		<script>
		  window.opener.postMessage({
			success: true,
			token: '${jwtToken}',
			username: '${escapedUsername}',
			email: '${escapedEmail}',
			image: '${escapedImage}',
			message: 'Success! You can now close the window.'
		  }, '*');
		  window.close();
		</script>
	  `);
	} catch (error: any) {
		// Handle errors properly
		console.error("Error during Spotify authentication:", error);
		res.send(`
			<script>
				window.opener.postMessage({
					success: false,
					message: '${error.message}'
				}, '*');
				window.close();
			</script>
		`);
	}
});

router.post("/auth/login", async (req, res) => {
	// const { username, password } = req.body;
	// const token = await login(username, password);
	// const user = await getUser(username);
	// if (token && user) {
	//   const jwtToken = jwt.sign({ token, user }, jwtSecret, { expiresIn: '1h' });
	//   res.cookie('LoginToken', jwtToken, { httpOnly: true });
	//   res.json({ message: 'Login successful', token: jwtToken });
	// } else {
	//   res.status(401).json({ message: 'Invalid credentials' });
	// }
});

router.post("/auth/logout", authenticateToken, (req, res) => {
	triggerLogout(req, res);
	res.status(200).json({ message: "Successfully logged out" });
});
export default router;
