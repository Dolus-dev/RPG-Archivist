import express, { Request, Response } from "express";
import consola from "consola";
import "dotenv/config";
import {
	APIUser,
	RESTPostOAuth2AccessTokenResult,
} from "discord-api-types/v10";
import FetchUser from "../../../lib/discord-interactions/fetch-user";
import { DATABASE } from "../../..";
import { User } from "../../../models/user";

export const router = express.Router();

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_API_ENDPOINT = process.env.DISCORD_API_ENDPOINT;
const REDIRECT_URL = process.env.DISCORD_AUTH_REDIRECT_URL;

router.get("/callback", async (req: Request, res: Response) => {
	const { code, state } = req.query;
	const storedState = req.cookies["oauth_state"];

	if (!state || state !== storedState) {
		return res.status(400).json({ error: "Invalid state parameter" });
	}

	if (!code) {
		return res.status(400).json({ error: "Code parameter not received" });
	}
	try {
		const authData = await FetchAccessToken(String(code));
		consola.debug("Received access token from Discord:", authData);
		const user = await FetchUser(authData.access_token);

		consola.debug("Fetched user data from Discord:", user);
		await RegisterUser(user, authData);
		consola.debug("User registered/updated in database");
		await GenerateSession(req, user, authData);
		consola.debug("Session generated for user");
		res.clearCookie("oauth_state");

		consola.success(
			`User ${user.username} (${user.id}) authenticated successfully`,
		);
		// Redirect to the frontend application after successful authentication
	} catch (error) {
		consola.error(error);
	}
});

async function GenerateSession(
	req: Request,
	user: APIUser,
	AuthData: RESTPostOAuth2AccessTokenResult,
) {
	req.session.userId = user.id;
	req.session.username = user.global_name || user.username;
	req.session.accessToken = AuthData.access_token;
	req.session.refreshToken = AuthData.refresh_token;
	req.session.avatarHash = user.avatar || null;
}

async function FetchAccessToken(
	code: string,
): Promise<RESTPostOAuth2AccessTokenResult> {
	const accessTokenResponse = await fetch(
		`${DISCORD_API_ENDPOINT}/oauth2/token`,
		{
			method: "POST",
			body: new URLSearchParams({
				client_id: CLIENT_ID as string,
				client_secret: CLIENT_SECRET as string,
				grant_type: "authorization_code",
				redirect_uri: REDIRECT_URL as string,
				code: code as string,
			}).toString(),
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		},
	);

	if (!accessTokenResponse.ok) {
		throw new Error(
			`Failed to fetch access token from Discord: \n ${accessTokenResponse}`,
		);
	}

	return (await accessTokenResponse.json()) as RESTPostOAuth2AccessTokenResult;
}

async function RegisterUser(
	user: APIUser,
	AuthData: RESTPostOAuth2AccessTokenResult,
) {
	try {
		const users = DATABASE.getRepository(User);

		await users.upsert(
			{
				id: user.id,
				username: user.global_name || user.username,
				avatarHash: user.avatar || null,
				accessToken: AuthData.access_token,
				refreshToken: AuthData.refresh_token,
			},
			{
				conflictPaths: ["id"],
				skipUpdateIfNoValuesChanged: true,
			},
		);
	} catch (error) {
		throw new Error(`Failed to register/update user in database: \n ${error}`);
	}
}
