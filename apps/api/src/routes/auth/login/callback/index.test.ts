import express from "express";
import cookieParser from "cookie-parser";
import { beforeAll, afterEach, describe, expect, it, vi } from "vitest";
import { runTestApp } from "../../../../lib/testing";

const mockFetchUser = vi.fn();
const mockEncryptToken = vi.fn(() => "encrypted");
const mockRevokeAuthSessionById = vi.fn();
const mockDestroyWebSession = vi.fn();

const usersRepo = {
	upsert: vi.fn(),
	findOne: vi.fn(),
};

const sessionsRepo = {
	upsert: vi.fn(),
};

const mockTransaction = vi.fn(async (cb: any) => {
	const tx = {
		getRepository: (entity: any) => {
			if (entity?.name === "User") return usersRepo;
			return sessionsRepo;
		},
	};
	return cb(tx);
});

vi.mock("../../../../lib/discord-interactions/fetch-user", () => ({
	default: mockFetchUser,
}));

vi.mock("../../../../lib/crypto/encrypt", () => ({
	default: mockEncryptToken,
}));

vi.mock("../../../../lib/auth-flow/shared-functions", () => ({
	revokeAuthSessionById: mockRevokeAuthSessionById,
	destroyWebSession: mockDestroyWebSession,
}));

vi.mock("../../../../models/user", () => ({
	User: class User {},
}));

vi.mock("../../../../models/session", () => ({
	UserAuthSession: class UserAuthSession {},
}));

vi.mock("../../../..", () => ({
	CLIENT_ID: "test-client-id",
	CLIENT_SECRET: "test-client-secret",
	DISCORD_API_ENDPOINT: "https://discord.com/api",
	FRONTEND_URL: "http://localhost:3000",
	REDIRECT_URL: "http://localhost:4000/auth/login/callback",
	REFRESH_TOKEN_TTL_SECONDS: 3600,
	keyProvider: {
		getActiveVersion: () => 1,
		getKeyring: () => ({ 1: "dev-key" }),
	},
	DATABASE: {
		transaction: mockTransaction,
	},
}));

let callbackRouter: express.Router;

beforeAll(async () => {
	vi.resetModules();
	const mod = await import("./index.js");
	callbackRouter = mod.router;
});

afterEach(() => {
	vi.clearAllMocks();
	vi.unstubAllGlobals();
});

function buildApp() {
	return runTestApp((app) => {
		app.use(cookieParser());

		app.use((req: any, _res, next) => {
			req.sessionID = "sess-123";
			req.session = {
				save: (cb: (err?: Error | null) => void) => cb(null),
			};
			next();
		});

		app.use("/auth/login/callback", callbackRouter);
	});
}

function mockDiscordTokenFetchOk() {
	const realFetch = globalThis.fetch;

	vi.stubGlobal(
		"fetch",
		vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
			const url =
				typeof input === "string"
					? input
					: input instanceof URL
						? input.toString()
						: input.url;

			if (url === "https://discord.com/api/oauth2/token") {
				return {
					ok: true,
					status: 200,
					statusText: "OK",
					json: async () => ({
						access_token: "access-token",
						refresh_token: "refresh-token",
						expires_in: 3600,
					}),
				} as Response;
			}

			return realFetch(input as any, init);
		}) as any,
	);
}

describe("GET /auth/login/callback", () => {
	it("redirects to frontend error page when state format is invalid", async () => {
		const server = await buildApp();
		try {
			const res = await fetch(
				server.baseUrl +
					"/auth/login/callback?code=abc&state=invalid-state-format",
				{
					redirect: "manual",
					headers: { Cookie: "oauth_state=aaaaaaaaaaaaaaaa" },
				},
			);

			expect(res.status).toBe(302);
			expect(res.headers.get("location")).toBe(
				"http://localhost:3000/login?error=AuthenticationFailed",
			);
		} finally {
			await server.close();
		}
	});

	it("redirects to frontend error page when state mismatches cookie", async () => {
		const server = await buildApp();
		try {
			const res = await fetch(
				server.baseUrl +
					"/auth/login/callback?code=abc&state=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
				{
					redirect: "manual",
					headers: { Cookie: "oauth_state=bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" },
				},
			);

			expect(res.status).toBe(302);
			expect(res.headers.get("location")).toBe(
				"http://localhost:3000/login?error=AuthenticationFailed",
			);
		} finally {
			await server.close();
		}
	});

	it("completes OAuth flow and redirects to frontend on success", async () => {
		mockDiscordTokenFetchOk();

		mockFetchUser.mockResolvedValue({
			id: "123",
			username: "tester",
			global_name: "Tester",
			avatar: null,
		});

		usersRepo.findOne.mockResolvedValue({
			discordId: "123",
			username: "tester",
		});

		const server = await buildApp();
		try {
			const state = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
			const res = await fetch(
				server.baseUrl + "/auth/login/callback?code=abc&state=" + state,
				{
					method: "GET",
					redirect: "manual",
					headers: { Cookie: "oauth_state=" + state },
				},
			);

			expect(res.status).toBe(302);
			expect(res.headers.get("location")).toBe("http://localhost:3000");

			expect(mockTransaction).toHaveBeenCalled();
			expect(usersRepo.upsert).toHaveBeenCalled();
			expect(usersRepo.findOne).toHaveBeenCalled();
			expect(sessionsRepo.upsert).toHaveBeenCalled();
			expect(mockFetchUser).toHaveBeenCalled();
			expect(mockEncryptToken).toHaveBeenCalled();

			const setCookie = res.headers.get("set-cookie") || "";
			expect(setCookie).toContain("oauth_state=");
		} finally {
			await server.close();
		}
	});
});
