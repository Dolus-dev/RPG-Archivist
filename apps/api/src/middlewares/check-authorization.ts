// Middleware route that checks for an existing user session. If a session exists, the user is authenticated and the request can proceed.
import { timingSafeEqual } from "crypto";
import { NextFunction, Request, Response } from "express";

export const checkUserSession = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (userSessionExists(req) || botTokenValid(req)) {
		return next();
	}

	return res.status(401).json({ error: "Unauthorized" });
};

function userSessionExists(req: Request): boolean {
	const sessionExists = Boolean(req.session);
	return sessionExists;
}

function botTokenValid(req: Request): boolean {
	const token = req.headers.authorization?.replace("Bot ", "");

	if (!token) {
		return false;
	}

	const tokenValid = timingSafeEqual(
		Buffer.from(token),
		Buffer.from(process.env.BOT_API_SECRET!),
	);

	return tokenValid;
}
