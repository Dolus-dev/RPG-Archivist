import { APIUser } from "discord-api-types/v10";

export default async function FetchUser(accessToken: string): Promise<APIUser> {
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
