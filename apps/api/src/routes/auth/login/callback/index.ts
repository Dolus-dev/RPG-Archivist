import express, { Request, Response } from "express";
import consola from "consola";
import "dotenv/config";
import * as z from "zod";
import { APIUser } from "discord-api-types/v10";
import FetchUser from "../../../../lib/discord-interactions/fetch-user";
import {
	CLIENT_ID,
	CLIENT_SECRET,
	DATABASE,
	DISCORD_API_ENDPOINT,
	FRONTEND_URL,
	keyProvider,
	REDIRECT_URL,
	REFRESH_TOKEN_TTL_SECONDS,
} from "../../../..";
import { User } from "../../../../models/user";
import { UserAuthSession } from "../../../../models/session";
import encryptToken from "../../../../lib/crypto/encrypt";
import {
	destroyWebSession,
	revokeAuthSessionById,
} from "../../../../lib/auth-flow/shared-functions";

export const router = express.Router();

type AuthTokenData = {
	access_token: string;
	refresh_token: string | null;
	expires_in: number;
};

const OAUTH_STATE_PATTERN = /^[a-f0-9]{32}$/;
const OAuthTokenSchema = z
	.object({
		access_token: z.string().min(1),
		refresh_token: z.string().min(1).optional(),
		expires_in: z.coerce.number().int().positive(),
	})
	.loose();

const DiscordUserSchema = z
	.object({
		id: z.string().min(1),
		username: z.string().min(1),
		global_name: z.string().min(1).nullable().optional(),
		avatar: z.string().min(1).nullable().optional(),
	})
	.loose();

router.get("/", async (req: Request, res: Response) => {
	let authSessionId: string | null = null;
	try {
		validateOAuthState(req);
		const code = getOAuthCode(req);
		const authData = await fetchAccessTokenFromDiscord(code);
		const discordUser = await fetchDiscordUserProfile(
			authData.access_token,
			req,
		);
		authSessionId = await upsertUserAndSessionTransaction(
			discordUser,
			authData,
			req.sessionID,
		);

		try {
			await persistWebSession(req, discordUser, authSessionId);
		} catch (error) {
			const [revokeResult, destroyResult] = await Promise.allSettled([
				revokeAuthSessionById(authSessionId, "web_session_save_failure"),
				destroyWebSession(req),
			]);

			if (revokeResult.status === "rejected") {
				consola.error(
					"Failed to revoke auth session after web session save failure:",
					revokeResult.reason,
				);
			}
			if (destroyResult.status === "rejected") {
				consola.error(
					"Failed to destroy web session after web session save failure:",
					destroyResult.reason,
				);
			}

			throw new Error("Failed to save web session", { cause: error as Error });
		}

		clearOAuthStateCookie(res);

		consola.success(
			`User ${discordUser.username} (${discordUser.id}) authenticated successfully`,
		);
		return res.status(302).redirect(FRONTEND_URL);
	} catch (error) {
		consola.error("OAuth callback failed:", error);
		return res
			.status(302)
			.redirect(`${FRONTEND_URL}/login?error=AuthenticationFailed`);
	}
});

function validateOAuthState(req: Request): void {
	const returnedState = req.query.state;
	const storedState = req.cookies["oauth_state"];

	if (
		typeof returnedState !== "string" ||
		!OAUTH_STATE_PATTERN.test(returnedState)
	) {
		throw new Error("Invalid state parameter");
	}
	if (returnedState !== storedState) {
		throw new Error("State parameter mismatch");
	}
}

function getOAuthCode(req: Request): string {
	const code = req.query.code?.toString().trim();
	if (!code || typeof code !== "string") {
		throw new Error("Code parameter not received");
	}

	return code;
}

async function fetchDiscordUserProfile(
	accessToken: string,
	req: Request,
): Promise<APIUser> {
	const rawUser = await FetchUser(accessToken, req);
	const parsedUser = DiscordUserSchema.safeParse(rawUser);
	if (!parsedUser.success) {
		throw new Error("Invalid user data received from Discord");
	}

	return rawUser;
}

async function fetchAccessTokenFromDiscord(
	code: string,
): Promise<AuthTokenData> {
	const response = await fetch(`${DISCORD_API_ENDPOINT}/oauth2/token`, {
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
	});
	if (!response.ok) {
		throw new Error(
			`Failed to fetch access token from Discord: \n ${response.status} ${response.statusText}`,
		);
	}

	const body = (await response.json()) as unknown;

	return parseOAuthTokenResponse(body);
}
function parseOAuthTokenResponse(body: unknown): AuthTokenData {
	const parsed = OAuthTokenSchema.safeParse(body);
	if (!parsed.success) {
		consola.error("Invalid token response from Discord: ", parsed.error);
		throw new Error("Invalid token response from Discord");
	}
	return {
		access_token: parsed.data.access_token,
		refresh_token: parsed.data.refresh_token ?? null,
		expires_in: parsed.data.expires_in,
	};
}

async function upsertUserAndSessionTransaction(
	discordUser: APIUser,
	authData: AuthTokenData,
	sessionId: string,
): Promise<string> {
	return DATABASE.transaction(async (tx) => {
		const users = tx.getRepository(User);
		const sessions = tx.getRepository(UserAuthSession);

		const user = await upsertUser(users, discordUser);

		await upsertAuthSession(sessions, user.discordId, sessionId, {
			access_token: authData.access_token,
			refresh_token: authData.refresh_token,
			expires_in: authData.expires_in,
		});

		return sessionId;
	});
}

async function upsertUser(
	users: ReturnType<typeof DATABASE.getRepository<User>>,
	discordUser: APIUser,
): Promise<User> {
	await users.upsert(
		{
			discordId: discordUser.id,
			username: discordUser.username,
			displayName: discordUser.global_name ?? null,
			avatarHash: discordUser.avatar ?? null,
			lastLoginAt: new Date(),
			isActive: true,
		},
		{
			conflictPaths: ["discordId"],
			skipUpdateIfNoValuesChanged: true,
		},
	);

	const user = await users.findOne({ where: { discordId: discordUser.id } });
	if (!user) {
		throw new Error("Failed to retrieve user after upsert");
	}
	return user;
}

async function upsertAuthSession(
	sessions: ReturnType<typeof DATABASE.getRepository<UserAuthSession>>,
	userDiscordId: string,
	sessionId: string,
	authData: {
		access_token: string;
		refresh_token: string | null;
		expires_in: number;
	},
): Promise<void> {
	const now = new Date();
	const { expires_in, access_token, refresh_token } = authData;
	const accessTokenExpiresAt = addSeconds(now, expires_in);
	const sessionExpiresAt = addSeconds(now, REFRESH_TOKEN_TTL_SECONDS);

	const accessTokenEncrypted = encryptToken(
		access_token,
		keyProvider.getActiveVersion(),
		keyProvider.getKeyring(),
		buildTokenAad(userDiscordId, sessionId, "access"),
	);
	const refreshTokenEncrypted = refresh_token
		? encryptToken(
				refresh_token,
				keyProvider.getActiveVersion(),
				keyProvider.getKeyring(),
				buildTokenAad(userDiscordId, sessionId, "refresh"),
			)
		: null;

	await sessions.upsert(
		{
			sessionId,
			user: { discordId: userDiscordId } as User,
			accessTokenEncrypted,
			accessTokenExpiresAt,
			refreshTokenEncrypted,
			expiresAt: sessionExpiresAt,
			lastUsedAt: now,
			revokedAt: null,
			revokeReason: null,
			encryptionKeyVersion: keyProvider.getActiveVersion(),
		},
		{
			conflictPaths: ["sessionId"],
		},
	);
}

async function persistWebSession(
	req: Request,
	discordUser: APIUser,
	authSessionId: string,
): Promise<void> {
	req.session.userDiscordId = discordUser.id;
	req.session.authSessionId = authSessionId;
	req.session.username = discordUser.global_name || discordUser.username;
	req.session.avatarHash = discordUser.avatar || null;

	await new Promise<void>((resolve, reject) => {
		req.session.save((err) => (err ? reject(err) : resolve()));
	});
}

function clearOAuthStateCookie(res: Response): void {
	res.clearCookie("oauth_state", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
	});
}

function addSeconds(date: Date, seconds: number): Date {
	return new Date(date.getTime() + seconds * 1000);
}

function buildTokenAad(
	userDiscordId: string,
	sessionId: string,
	tokenType: "access" | "refresh",
): string {
	return `${tokenType}:${userDiscordId}:${sessionId}`;
}
