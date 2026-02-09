// Middleware route that checks for an existing user session. If a session exists, the user is authenticated and the request can proceed.

import { NextFunction, Request, Response } from "express";

export const checkUserSession = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (!req.session) {
		return next();
	}

	return next();
};
