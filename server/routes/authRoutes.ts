import { Router } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { authenticateToken } from "../middleware/authMiddleware";
import { loginHandler } from "../utils/methods/loginHandler";
import Spotify from "../utils/spotify/Spotify";
import Youtube from "../utils/youtube/Youtube";
import config from "../utils/config.json";
import { triggerLogout } from "../middleware/authMiddleware";
import User from "../models/User";

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
			message: 'Success logging with Youtube!'
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
			message: 'Success logging with Spotify!'
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
	try {
		const { username, password } = req.body;
		const user = await User.findOne({
			$or: [{ username }, { email: username }],
		});
		console.log(user);
		if (!user) {
			return res
				.status(401)
				.json({ message: "Invalid user", type: "ERROR" });
		}
		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) {
			return res
				.status(401)
				.json({ message: "Invalid password", type: "ERROR" });
		}
		const token = jwt.sign({ userId: user._id }, "your-secret-key", {
			expiresIn: "1h",
		});
		res.status(200).json({
			message: "Login succesfull",
			type: "SUCCESS",
			token,
			username: user.username,
			email: user.email,
			id: user._id,
		});
	} catch (error) {
		res.status(500).json({ message: "Login failed", type: "ERROR" });
	}
});

// Add more error handling to signup
router.post("/auth/signup", async (req, res) => {
	try {
		const { username, password, email } = req.body;
		const hashedPassword = await bcrypt.hash(password, 10);
		const user = new User({ username, password: hashedPassword, email });
		await user.save();
		res.status(201).json({
			message: "User registered successfully",
			type: "SUCCESS",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Registration failed", type: "ERROR" });
	}
});

router.post("/auth/logout", authenticateToken, (req, res) => {
	triggerLogout(req, res);
	res.status(200).json({ message: "Successfully logged out" });
});
export default router;
