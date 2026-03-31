import express from "express";
import { AddressInfo } from "net";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as z from "zod";

vi.mock("../../models/base-content-entity", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("../../models/base-content-entity")>();
	return {
		...actual,
		ContentSourceType: {
			OFFICIAL: "official",
			HOMEBREW: "homebrew",
		},
	};
});

vi.mock("../../models/trait", () => {
	return {
		EffectPayloadSchema: z
			.object({
				schemaVersion: z.literal(1),
				effects: z.array(z.any()),
				notes: z.string().optional().nullable(),
			})
			.strict(),
		Trait: class Trait {},
		TraitVersion: class TraitVersion {},
	};
});

vi.mock("../../models/user", () => {
	return {
		User: class User {},
	};
});

vi.mock("../../index", () => {
	return {
		DATABASE: {
			manager: {
				transaction: vi.fn(),
			},
		},
	};
});

import { DATABASE } from "../../index";
import { router } from "./index";

type TestServer = {
	baseUrl: string;
	close: () => Promise<void>;
};

function buildApp(sessionUserDiscordId?: string) {
	const app = express();
	app.use(express.json());

	app.use((req: any, _res, next) => {
		req.session = sessionUserDiscordId
			? { userDiscordId: sessionUserDiscordId }
			: {};
		next();
	});

	app.use("/traits", router);
	return app;
}

async function startServer(sessionUserDiscordId?: string): Promise<TestServer> {
	const app = buildApp(sessionUserDiscordId);
	const server = app.listen(0);

	await new Promise<void>((resolve) =>
		server.once("listening", () => resolve()),
	);

	const port = (server.address() as AddressInfo).port;

	return {
		baseUrl: "http://127.0.0.1:" + port,
		close: () =>
			new Promise<void>((resolve, reject) =>
				server.close((err) => (err ? reject(err) : resolve())),
			),
	};
}

function validBody() {
	return {
		name: "Spidey Sense",
		description: "Warns of danger",
		sourceType: "homebrew",
		isPublic: false,
		rulesText: "You gain heightened awareness.",
		publishNow: true,
		effectPayload: {
			schemaVersion: 1,
			effects: [
				{
					kind: "sense",
					senseKey: "spidey_sense",
					displayName: "Spidey Sense",
					description: "You can sense immediate danger.",
				},
			],
		},
	};
}

afterEach(() => {
	vi.clearAllMocks();
});

describe("POST /traits", () => {
	it("returns 201 with ids on success", async () => {
		vi.mocked(DATABASE.manager.transaction).mockResolvedValue({
			trait: { id: "trait-1", slug: "spidey-sense" },
			version: { id: "ver-1", versionNumber: 1 },
		});

		const server = await startServer("12345");
		try {
			const res = await fetch(server.baseUrl + "/traits", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(validBody()),
			});

			expect(res.status).toBe(201);
			const json = await res.json();
			expect(json).toEqual({
				id: "trait-1",
				slug: "spidey-sense",
				versionId: "ver-1",
				versionNumber: 1,
			});
		} finally {
			await server.close();
		}
	});

	it("returns 400 for invalid body", async () => {
		const server = await startServer("12345");
		try {
			const res = await fetch(server.baseUrl + "/traits", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ name: "" }),
			});

			expect(res.status).toBe(400);
			const json = await res.json();
			expect(json.error).toBe("Invalid request body");
			expect(Array.isArray(json.details)).toBe(true);
			expect(DATABASE.manager.transaction).not.toHaveBeenCalled();
		} finally {
			await server.close();
		}
	});

	it("returns 401 when session user is missing", async () => {
		const server = await startServer(undefined);
		try {
			const res = await fetch(server.baseUrl + "/traits", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(validBody()),
			});

			expect(res.status).toBe(401);
		} finally {
			await server.close();
		}
	});

	it("returns 401 when transaction fails with stale session user", async () => {
		vi.mocked(DATABASE.manager.transaction).mockRejectedValue(
			new Error("Authenticated user not found"),
		);

		const server = await startServer("12345");
		try {
			const res = await fetch(server.baseUrl + "/traits", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(validBody()),
			});

			expect(res.status).toBe(401);
			const json = await res.json();
			expect(json.error).toBe("User session invalid");
		} finally {
			await server.close();
		}
	});

	it("returns 500 for unexpected errors", async () => {
		vi.mocked(DATABASE.manager.transaction).mockRejectedValue(
			new Error("db exploded"),
		);

		const server = await startServer("12345");
		try {
			const res = await fetch(server.baseUrl + "/traits", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(validBody()),
			});

			expect(res.status).toBe(500);
			const json = await res.json();
			expect(json.error).toBe("Failed to create trait");
		} finally {
			await server.close();
		}
	});
});
