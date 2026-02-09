import { timingSafeEqual } from "crypto";
import { Request, Response, NextFunction } from "express";

export function checkBotAuthorization(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const token = req.headers.authorization?.replace("Bot ", "");

	if (!token) {
		return res.status(401).json({ error: "Unauthorized: No token provided" });
	}

	const tokenValid = timingSafeEqual(
		Buffer.from(token),
		Buffer.from(process.env.BOT_API_SECRET || ""),
	);

	if (!tokenValid) {
		return res.status(401).json({ error: "Unauthorized: Invalid token" });
	}

	return next();
}
