import Spotify from "../spotify/Spotify";
import Youtube from "../youtube/Youtube";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response } from "express";
import getLoginCookies from "../../middleware/authMiddleware";
import Token from "../interfaces/tokens/Token";
dotenv.config();

const jwtSecret = process.env.JWT_SECRET!;

const loginHandler = async (
	code: string,
	source: Youtube | Spotify,
): Promise<string> => {
	try {
		const { token, user } = await source.getAuthToken(code);
		const { username, image, email } = user;
		const tokenPayload = {
			accessToken: token.access_token,
			username,
			email,
			image,
		};
		const jwtToken = jwt.sign({ tokenPayload }, jwtSecret, {
			expiresIn: "1h",
		});
		const escapedUsername = username.replace(/'/g, "\\'");
		const escapedEmail = email.replace(/'/g, "\\'");
		const escapedImage = image.replace(/'/g, "\\'");
		const successScript = `
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
		`;
		return successScript;
	} catch (error: any) {
		console.error("Error exchanging code for token:", error);
		return error.message;
	}
};

export { loginHandler };
