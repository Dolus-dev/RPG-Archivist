import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

const app = express();
app.use(cookieParser());
app.use(
	cors({
		credentials: true,
		origin: process.env.FRONTEND_URL || "http://localhost:3000",
	}),
);
const PORT = 3001;

// Add environment variable checks here

async function startServer() {
	app.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`);
	});
}

startServer();
