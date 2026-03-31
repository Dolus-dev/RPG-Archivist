import express from "express";
import { beforeAll, describe, expect, it, vi } from "vitest";
import {
	getSetCookieHeader,
	readCookieValue,
	runTestApp,
} from "../../../lib/testing";

// Keep callback mocked; this must stay at top-level.
vi.mock("./callback", () => {
	return { router: express.Router() };
});

let loginRouter: express.Router;

beforeAll(async () => {
	process.env.DISCORD_CLIENT_ID = "test-client-id";
	process.env.OAUTH_REDIRECT_URI = "http://localhost:4000/auth/login/callback";
	process.env.NODE_ENV = "test";

	// Ensure fresh module evaluation with updated env.
	vi.resetModules();

	const mod = await import("./index.js");
	loginRouter = mod.router;
});

describe("POST /auth/login", () => {
	it("sets oauth_state cookie and redirects to Discord OAuth authorize URL", async () => {
		const server = await runTestApp((app) => {
			app.use("/auth/login", loginRouter);
		});

		try {
			const res = await fetch(`${server.baseUrl}/auth/login`, {
				method: "POST",
				redirect: "manual",
			});

			expect(res.status).toBe(302);

			const location = res.headers.get("location");
			expect(location).toBeTruthy();

			const authUrl = new URL(location as string);
			expect(authUrl.origin + authUrl.pathname).toBe(
				"https://discord.com/api/oauth2/authorize",
			);
			expect(authUrl.searchParams.get("client_id")).toBe("test-client-id");
			expect(authUrl.searchParams.get("redirect_uri")).toBe(
				"http://localhost:4000/auth/login/callback",
			);
			expect(authUrl.searchParams.get("response_type")).toBe("code");
			expect(authUrl.searchParams.get("scope")).toBe(
				"identify guilds guilds.members.read email",
			);

			const state = authUrl.searchParams.get("state");
			expect(state).toMatch(/^[a-f0-9]{32}$/);

			const setCookie = getSetCookieHeader(res);
			expect(setCookie).toContain("oauth_state=");
			expect(setCookie).toContain("HttpOnly");
			expect(setCookie).toContain("SameSite=Lax");
			expect(setCookie).toContain("Max-Age=900");

			const cookieState = readCookieValue(setCookie, "oauth_state");
			expect(cookieState).toBe(state);
		} finally {
			await server.close();
		}
	});
});
