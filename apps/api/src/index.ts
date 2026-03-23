import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import session from "express-session";
import consola from "consola";
import { createClient } from "redis";
import { DataSource } from "typeorm";
import { router as baseRouter } from "./routes/base-router";
import { User } from "./models/user";
import { Guild } from "./models/guild";
import { Campaign } from "./models/campaign";

import { KeyProvider } from "./lib/crypto/constants";
import { UserAuthSession } from "./models/session";

export const keyProvider = new KeyProvider();

export const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
export const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
export const DISCORD_API_ENDPOINT = process.env.DISCORD_API_ENDPOINT;
export const REDIRECT_URL = process.env.DISCORD_AUTH_REDIRECT_URL;
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

export const REFRESH_TOKEN_TTL_SECONDS = Number(
	process.env.DISCORD_REFRESH_TOKEN_TTL_SECONDS || 7 * 24 * 60 * 60,
);

if (!CLIENT_ID || !CLIENT_SECRET || !DISCORD_API_ENDPOINT || !REDIRECT_URL) {
	consola.error(
		"Missing required environment variables. Please ensure ALL env variables are set.",
	);
	process.exit(1);
}

consola.level = process.env.NODE_ENV === "production" ? 2 : 5; // Error in production, Debug in development

export const redisClient = createClient({
	username: process.env.REDIS_USERNAME || "default",
	password: process.env.REDIS_PASSWORD || "",
	socket: {
		host: process.env.REDIS_HOST || "localhost",
		port: Number(process.env.REDIS_PORT) || 6379,
	},
});

(async () => {
	redisClient.on("error", (err) => consola.error("Redis Client Error", err));
	redisClient.on("connect", () => consola.log("Connecting to Redis server"));
	redisClient.on("ready", () => consola.success("Connected to Redis server"));
	await redisClient.connect();

	await redisClient.ping();
})();

const app = express();
app.use(cookieParser());
app.use(
	cors({
		credentials: true,
		origin: process.env.FRONTEND_URL || "http://localhost:3000",
	}),
);
app.use(express.json());
app.use(
	session({
		secret: process.env.SESSION_SECRET || "DevelopmentSecret",
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 1000 * 60 * 60 * 24, // 1 day
		},
	}),
);
const SERVER_PORT = process.env.SERVER_PORT || 4000;

// Add environment variable checks here
if (!process.env.SESSION_SECRET) {
	consola.warn(
		"Warning: SESSION_SECRET is not set. Using local development secret.",
	);
}
if (!process.env.PORT) {
	consola.warn("Warning: PORT is not set. Using default port 4000.");
}

export const DATABASE = new DataSource({
	type: "postgres",
	host: process.env.DB_HOST || "localhost",
	port: Number(process.env.DB_PORT) || 5432,
	username: process.env.DB_USERNAME || "postgres",
	password: process.env.DB_PASSWORD || "password",
	database: process.env.DB_NAME || "RPG-Archivist",
	entities: [User, UserAuthSession],
	synchronize: process.env.NODE_ENV !== "production",
	dropSchema: process.env.NODE_ENV === "development",
	logging: false,
});

app.use(baseRouter);

async function startServer() {
	try {
		consola.log("Starting server...");
		consola.log("Connecting to database...");
		await DATABASE.initialize();
		consola.success("Database connection established successfully");

		if (process.env.NODE_ENV === "development") {
			keyProvider.initializeDevEnv();
			consola.debug(
				"Development keyring initialized:",
				keyProvider.getKeyring(),
			);
			consola.debug(
				"Active encryption key version:",
				keyProvider.getActiveVersion(),
			);
			consola.debug(
				"Warning: Using random encryption key in development. Data will not be recoverable if the server restarts.",
			);
		}

		app.listen(SERVER_PORT, () => {
			consola.log(`Server is running on port ${SERVER_PORT}`);
		});
	} catch (error) {
		consola.error("Failed to start server:", error);
		process.exit(1);
	}
}

startServer();
