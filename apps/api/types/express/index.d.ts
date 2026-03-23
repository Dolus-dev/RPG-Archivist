import "express-session";

declare module "express-session" {
	interface SessionData {
		userDiscordId?: string;
		username?: string;
		avatarHash?: string | null;
		authSessionId?: string;
	}
}
