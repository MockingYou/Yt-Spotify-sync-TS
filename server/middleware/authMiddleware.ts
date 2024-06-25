import { Request, Response, NextFunction } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import dotenv from "dotenv";
import Token from "../utils/interfaces/tokens/Token";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET!;

export const getLoginCookies = (req: Request): string[] => {
	return Object.keys(req.cookies).filter((cookieName) =>
		cookieName.includes("Token"),
	);
};

export const triggerLogout = (req: Request, res: Response) => {
	let loginTokens = getLoginCookies(req);
	loginTokens.forEach((token: string) => {
		res.clearCookie(token);
	});
};

export const authenticateToken = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const loginTokens = getLoginCookies(req);
	console.log(loginTokens);
	if (loginTokens.length === 0) {
		return res
			.status(401)
			.json({ error: "Authorization token is required" });
	}

	try {
		loginTokens.forEach((token) => {
			jwt.verify(token, jwtSecret) as {
				token: Token;
				user: any;
			};
		});
		next();
	} catch (error) {
		if (error instanceof TokenExpiredError) {
			triggerLogout(req, res);
			return res
				.status(401)
				.json({ error: "Token expired. Please log in again." });
		}
		console.error("Error verifying token:", error);
		return res.status(500).json({ error: "Failed to authenticate token" });
	}
};
