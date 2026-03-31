import express from "express";
import { AddressInfo } from "net";

export type RunningServer = {
	baseUrl: string;
	close: () => Promise<void>;
};

export async function runTestApp(
	configure: (app: express.Express) => void,
): Promise<RunningServer> {
	const app = express();
	app.use(express.json());
	configure(app);

	const server = app.listen(0);
	await new Promise<void>((resolve) => server.once("listening", resolve));

	const port = (server.address() as AddressInfo).port;

	return {
		baseUrl: `http://127.0.0.1:${port}`,
		close: () =>
			new Promise<void>((resolve, reject) =>
				server.close((err) => (err ? reject(err) : resolve())),
			),
	};
}

export function withSession(userDiscordId?: string) {
	return (req: any, _res: any, next: any) => {
		req.session = userDiscordId ? { userDiscordId } : {};
		next();
	};
}

export function getSetCookieHeader(res: Response): string {
	return res.headers.get("set-cookie") ?? "";
}

export function readCookieValue(
	setCookieHeader: string,
	cookieName: string,
): string | null {
	const firstPair = setCookieHeader.split(";")[0] ?? "";
	const [name, value] = firstPair.split("=");
	if (name?.trim() !== cookieName) return null;
	return value ?? null;
}
