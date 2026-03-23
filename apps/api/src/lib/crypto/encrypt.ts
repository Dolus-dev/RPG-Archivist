import crypto from "crypto";
import { ALGO, IV_LENGTH, AUTH_TAG_LENGTH, KeyRing } from "./constants";

export default function encryptToken(
	plainText: string,
	keyVersion: number,
	keyring: KeyRing,
	aad: string,
): string {
	const key = keyring[keyVersion];
	if (!key || key.length !== 32) throw new Error("Invalid encryption key");

	const iv = crypto.randomBytes(IV_LENGTH);
	const cipher = crypto.createCipheriv(ALGO, key, iv, {
		authTagLength: AUTH_TAG_LENGTH,
	});
	cipher.setAAD(Buffer.from(aad, "utf-8"));

	const cipherText = Buffer.concat([
		cipher.update(plainText, "utf-8"),
		cipher.final(),
	]);
	const tag = cipher.getAuthTag();

	return [
		`v${keyVersion}`,
		iv.toString("base64url"),
		cipherText.toString("base64url"),
		tag.toString("base64url"),
	].join(".");
}
