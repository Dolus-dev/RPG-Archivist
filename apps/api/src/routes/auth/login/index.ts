import express from "express";
import crypto from "crypto";
import "dotenv/config";
import consola from "consola";
import { router as LoginCallbackRouter } from "./callback";

export const router = express.Router();
router.use("/callback", LoginCallbackRouter);

const CLIENT_ID = process.env.DISCORD_CLIENT_ID!;

const REDIRECT_URI =
	process.env.OAUTH_REDIRECT_URI || "http://localhost:4000/auth/login/callback";
const SCOPES = ["identify", "guilds", "guilds.members.read", "email"].join(" ");

router.post("/", async (req, res) => {
	const state = crypto.randomBytes(16).toString("hex");

	consola.debug("Generated OAuth state: ", state);
	res.cookie("oauth_state", state, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 1000 * 60 * 15, // 15 minutes
	});

	const authUrl = new URL("https://discord.com/api/oauth2/authorize");
	authUrl.searchParams.set("client_id", CLIENT_ID);
	authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
	authUrl.searchParams.set("response_type", "code");
	authUrl.searchParams.set("scope", SCOPES);
	authUrl.searchParams.set("state", state);

	consola.debug(
		"Redirecting user to Discord OAuth2 authorization URL:",
		authUrl.toString(),
	);

	return res.status(302).redirect(authUrl.toString());
});
