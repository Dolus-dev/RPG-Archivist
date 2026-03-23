import consola from "consola";
import express from "express";
import {
	destroyWebSession,
	revokeAuthSessionById,
} from "../../../lib/auth-flow/shared-functions";

export const router = express.Router();

router.post("/", async (req, res) => {
	consola.debug("Received logout request");

	const sessionId = req.session.authSessionId;

	if (!sessionId) {
		consola.warn("Logout requested but user is not logged in");
		return res.status(200).json({ message: "User is already logged out" });
	}

	const revokeResult = await revokeAuthSessionById(sessionId, "user_logout");

	if (!revokeResult) {
		consola.error("Failed to revoke auth session for sessionId: ", sessionId);

		return res.status(500).json({ error: "Failed to revoke auth session" });
	}

	try {
		await destroyWebSession(req);
	} catch (error) {
		consola.error("Error destroying session during logout: ", error);
	}

	res.clearCookie("connect.sid", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
	});

	return res.json({ message: "Logged out successfully" });
});
