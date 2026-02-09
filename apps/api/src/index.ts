import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import session from "express-session";

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
	console.warn(
		"Warning: SESSION_SECRET is not set. Using local development secret.",
	);
}
if (!process.env.PORT) {
	console.warn("Warning: PORT is not set. Using default port 4000.");
}

async function startServer() {
	app.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`);
	});
}

startServer();
