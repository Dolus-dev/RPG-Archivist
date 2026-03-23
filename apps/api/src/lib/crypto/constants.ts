import consola from "consola";
import crypto from "crypto";

export const ALGO = "aes-256-gcm";
export const IV_LENGTH = 12; // 96 bits, recommended for GCM
export const AUTH_TAG_LENGTH = 16;

// version => 32-byte key
export type KeyRing = Record<number, Buffer>;

export class KeyProvider {
	private keyring: KeyRing = {};
	private activeVersion = 1;

	initializeDevEnv() {
		const devKey = crypto.randomBytes(32);
		this.addKey(1, devKey);
		this.setActiveVersion(1);

		consola.info("Initialized development keyring with random key");
	}

	addKey(version: number, key: Buffer) {
		if (!Number.isInteger(version) || version < 1) {
			throw new Error("Invalid key version");
		}
		if (key.length !== 32) {
			throw new Error("Invalid key length");
		}
		if (this.keyring[version]) throw new Error("Version already exists");
		this.keyring[version] = key;
	}

	setActiveVersion(version: number) {
		if (!this.keyring[version]) throw new Error("key version not loaded");
		this.activeVersion = version;
	}

	getKeyring(): KeyRing {
		return this.keyring;
	}

	getActiveVersion(): number {
		return this.activeVersion;
	}

	retireKey(version: number) {
		if (version === this.activeVersion)
			throw new Error("Cannot retire active key");
		delete this.keyring[version];
	}
}
