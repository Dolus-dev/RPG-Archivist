import "express-session";

declare module "express-session" {
	interface SessionData {
		userId?: string;
		username?: string;
		accessToken?: string;
		refreshToken?: string;
		avatarHash?: string | null;
	}
}
