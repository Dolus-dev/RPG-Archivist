import express, { Request, Response } from "express";
import consola from "consola";
import "dotenv/config";
import {
	APIUser,
	RESTPostOAuth2AccessTokenResult,
} from "discord-api-types/v10";
import FetchUser from "../../../lib/discord-interactions/fetch-user";

export const router = express.Router();

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_API_ENDPOINT = process.env.DISCORD_API_ENDPOINT;
const REDIRECT_URL = process.env.DISCORD_AUTH_REDIRECT_URL;

router.get("/callback", async (req, res) => {
	const { code } = req.query;
	if (!code) {
		return res.status(400).json({ error: "Code parameter not received" });
	}
	try {
		const authData = await FetchAccessToken(String(code));
		const user = await FetchUser(authData.access_token);

		GenerateSession();
	} catch (error) {
		consola.error(error);
	}
});

async function GenerateSession() {}

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
) {}
