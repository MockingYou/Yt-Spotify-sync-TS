import Spotify from "../spotify/Spotify";
import Youtube from "../youtube/Youtube";
import jwt from "jsonwebtoken";
import { generateRandomKey } from "../../utils/methods/generateRandomKey";

const jwtSecret = generateRandomKey();

const loginHandler = async (code: any, source: Youtube | Spotify): Promise<string> => {
	try {
		let tokenResult = await source.getAuthToken(code);
		let accessToken = tokenResult.access_token;
		const token = jwt.sign({ accessToken }, jwtSecret, { expiresIn: "1h" });
		const successScript = `
			<script>
			window.opener.postMessage({
				success: true,
				token: '${token}',
				message: 'Success! You can now close the window.'
			}, '*');
			</script>
		`;
		return successScript
	} catch (error: any) {
		console.error("Error exchanging code for token:", error);
		return error.message
	}
};

export { loginHandler }
