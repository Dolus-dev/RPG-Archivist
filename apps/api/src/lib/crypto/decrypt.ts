import { ALGO, AUTH_TAG_LENGTH, KeyRing } from "./constants";
import crypto from "crypto";

export default function decryptToken(
	payload: string,
	keyring: KeyRing,
	aad: string,
): string {
	const [v, ivB64, cipherTextB64, tagB64] = payload.split(".");
	if (!v || !ivB64 || !cipherTextB64 || !tagB64)
		throw new Error("Malformed payload");

	const keyVersion = Number(v.replace(/^v/, ""));
	const key = keyring[keyVersion];
	if (!key || key.length !== 32) throw new Error("Unknown key version");

	const iv = Buffer.from(ivB64, "base64url");
	const cipherText = Buffer.from(cipherTextB64, "base64url");
	const tag = Buffer.from(tagB64, "base64url");

	const decipher = crypto.createDecipheriv(ALGO, key, iv, {
		authTagLength: AUTH_TAG_LENGTH,
	});
	decipher.setAAD(Buffer.from(aad, "utf-8"));
	decipher.setAuthTag(tag);

	const plainText = Buffer.concat([
		decipher.update(cipherText),
		decipher.final(),
	]);
	return plainText.toString("utf-8");
}
