import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import session from "express-session";
import consola from "consola";
import { createClient } from "redis";

export const redisClient = createClient({
	username: process.env.REDIS_USERNAME || "default",
	password: process.env.REDIS_PASSWORD || "",
	socket: {
		host: process.env.REDIS_HOST || "localhost",
		port: Number(process.env.REDIS_PORT) || 6379,
	},
});

redisClient.on("error", (err) => {
	consola.error("Redis Client Error:", err);
});

redisClient.on("connect", () => {
	consola.success("Connected to Memurai");
});

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
			sameSite: "strict",
			maxAge: 1000 * 60 * 60 * 24, // 1 day
		},
	}),
);
const PORT = process.env.PORT || 4000;

// Add environment variable checks here
if (!process.env.SESSION_SECRET) {
	consola.warn(
		"Warning: SESSION_SECRET is not set. Using local development secret.",
	);
}
if (!process.env.PORT) {
	consola.warn("Warning: PORT is not set. Using default port 4000.");
}

async function startServer() {
	try {
		await redisClient.connect();
		app.listen(PORT, () => {
			consola.log(`Server is running on port ${PORT}`);
		});
	} catch (error) {
		consola.error("Failed to start server:", error);
		process.exit(1);
	}
}

startServer();
