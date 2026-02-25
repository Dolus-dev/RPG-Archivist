import { APIUser } from "discord-api-types/v10";
import { Request } from "express";
import { redisClient } from "../..";
import consola from "consola";

export default async function FetchUser(
	accessToken: string,
	req: Request,
): Promise<APIUser> {
	let user = null;
	consola.debug("Fetching user data with access token: ", accessToken);
	consola.debug(
		"Session data: ",
		req.session.userId ? { userId: req.session.userId } : "No session userId",
	);

	if (req.session.userId) {
		consola.debug("Session userId found: ", req.session.userId);
		const key = "user:" + req.session.userId;
		const value = await redisClient.get(key);
		if (value) {
			user = JSON.parse(value) as APIUser;
			consola.debug("Cache hit for user: ", req.session.userId);
			return user;
		} else {
			user = await fetchUserFromDiscord(accessToken);
			const key = "user:" + user.id;
			consola.debug(
				"Cache miss for user: ",
				req.session.userId,
				" - Fetched from Discord API",
			);
			// Cache user data in Redis for 15 minutes
			await redisClient.set(key, JSON.stringify(user), {
				EX: 60 * 15, // 15 minutes
			});

			consola.debug("User data cached in Redis for user: ", req.session.userId);
			return user;
		}
	} else {
		consola.debug(
			"No session userId found, fetching user data directly from Discord API",
		);
		user = await fetchUserFromDiscord(accessToken);
		console.debug("Fetched user data from Discord API: ", user);
		const key = "user:" + user.id;
		consola.debug("Updated cache key to: ", key);
		// Cache user data in Redis for 15 minutes
		await redisClient.set(key, JSON.stringify(user), {
			EX: 60 * 15, // 15 minutes
		});

		consola.debug("User data cached in Redis for user: ", user.id);
		return user;
	}
}

async function fetchUserFromDiscord(accessToken: string): Promise<APIUser> {
	const userRes = await fetch(`${process.env.DISCORD_API_ENDPOINT}/users/@me`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
	});
	if (!userRes.ok) {
		throw new Error(`Failed to fetch user data from Discord: \n ${userRes}`);
	}
	return (await userRes.json()) as APIUser;
}
