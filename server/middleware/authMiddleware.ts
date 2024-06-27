import { Request, Response, NextFunction } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import dotenv from "dotenv";
import Token from "../utils/interfaces/tokens/Token";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET!;

export const getLoginCookies = (req: Request): { [key: string]: string } => {
	return Object.keys(req.cookies)
		.filter((cookieName) => cookieName.includes("Token"))
		.reduce((acc, cookieName) => {
			acc[cookieName] = req.cookies[cookieName];
			return acc;
		}, {} as { [key: string]: string });
};

export const triggerLogout = (req: Request, res: Response) => {
	let loginCookies = getLoginCookies(req);
	Object.keys(loginCookies).forEach((cookieName) => {
		res.clearCookie(cookieName);
	});
};

export const authenticateToken = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const loginCookies = getLoginCookies(req);
	if (Object.keys(loginCookies).length === 0) {
		return res
			.status(401)
			.json({ error: "Authorization token is required" });
	}

	try {
		Object.values(loginCookies).forEach((token) => {
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
