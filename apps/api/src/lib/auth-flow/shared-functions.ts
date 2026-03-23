import { Request } from "express";
import { UserAuthSession } from "../../models/session";
import { DATABASE } from "../..";
import { IsNull } from "typeorm";

export async function destroyWebSession(req: Request): Promise<boolean> {
	return new Promise((resolve, reject) => {
		req.session.destroy((err) => (err ? reject(err) : resolve(true)));
	});
}

export async function revokeAuthSessionById(
	sessionId: string,
	reason: string,
): Promise<boolean> {
	const result = await DATABASE.getRepository(UserAuthSession).update(
		{
			sessionId: sessionId,
			revokedAt: IsNull(), // Only revoke if not already revoked
		},
		{
			revokedAt: new Date(),
			revokeReason: reason,
		},
	);

	return Boolean(result.affected && result.affected > 0);
}
