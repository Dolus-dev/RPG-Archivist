import consola from "consola";
import express from "express";

export const router = express.Router();

router.post("/", async (req, res) => {
	consola.debug("Received logout request");

	req.session.destroy((err) => {
		if (err) {
			consola.error("Error destroying session during logout: ", err);
			return res.status(500).json({ error: "Failed to log out" });
		}
		res.clearCookie("connect.sid", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
		});
		return res.status(200).json({ message: "Logged out successfully" });
	});
});
