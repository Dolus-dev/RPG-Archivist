import express from "express";
import { EffectPayloadSchema, Trait, TraitVersion } from "../../models/trait";
import * as z from "zod";
import consola from "consola";
import { ContentSourceType } from "../../models/base-content-entity";
import { checkAuthentication } from "../../middlewares/check-authorization";
import { DATABASE } from "../..";
import { EntityManager } from "typeorm";
import { User } from "../../models/user";

export const router = express.Router();

const postBodySchema = z
	.object({
		name: z.string().min(1),
		description: z.string().min(1).optional().nullable(),
		sourceType: z
			.enum([ContentSourceType.HOMEBREW, ContentSourceType.OFFICIAL])
			.optional()
			.default(ContentSourceType.HOMEBREW),
		isPublic: z.boolean().optional().default(false),
		rulesText: z.string().min(1),
		publishNow: z.boolean().optional().default(false),
		effectPayload: EffectPayloadSchema,
	})
	.strict();

type CreateTraitBody = z.infer<typeof postBodySchema>;

router.post("/", checkAuthentication, async (req, res) => {
	const body = req.body;
	const parsedBody = postBodySchema.safeParse(body);
	if (!parsedBody.success) {
		return res.status(400).json({
			error: `Invalid request body`,
			details: mapZodIssues(parsedBody.error),
		});
	}

	const userDiscordId = getSessionUserDiscordId(req);

	if (!userDiscordId) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	try {
		const result = await createTraitWithInitialVersion(
			parsedBody.data,
			userDiscordId,
		);

		return res.status(201).json({
			id: result.trait.id,
			slug: result.trait.slug,
			versionId: result.version.id,
			versionNumber: result.version.versionNumber,
		});
	} catch (error) {
		if (
			error instanceof Error &&
			error.message.includes("Authenticated user not found")
		) {
			return res.status(401).json({ error: "User session invalid" });
		}

		consola.error(
			"Error creating trait:",
			error instanceof Error ? error.message : String(error),
		);
		return res.status(500).json({ error: "Failed to create trait" });
	}
});

function generateSlug(name: string): string {
	const slug = name
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9\-]/g, "")
		.replace(/\-+/g, "-");

	if (slug.trim().length === 0) {
		throw new Error(
			"Generated slug is empty. Please provide a more descriptive name.",
		);
	}
	return slug;
}

function mapZodIssues(error: z.ZodError): string[] {
	return error.issues.map((i) => {
		const path = i.path.length > 0 ? i.path.join(".") : "body";
		return path + ": " + i.message;
	});
}

function getSessionUserDiscordId(req: express.Request): string | null {
	const value = req.session?.userDiscordId;
	return typeof value === "string" && value.length > 0 ? value : null;
}

async function createTraitWithInitialVersion(
	body: CreateTraitBody,
	userDiscordId: string,
): Promise<{ trait: Trait; version: TraitVersion }> {
	return DATABASE.manager.transaction(async (tx: EntityManager) => {
		const users = tx.getRepository(User);
		const traits = tx.getRepository(Trait);
		const traitVersions = tx.getRepository(TraitVersion);

		const author = await users.findOne({ where: { discordId: userDiscordId } });
		if (!author) {
			throw new Error("Authenticated user not found ");
		}

		const slug = generateSlug(body.name);

		const trait = traits.create({
			name: body.name,
			slug,
			description: body.description ?? null,
			sourceType: body.sourceType,
			isPublic: body.isPublic,
			author,
		});
		await traits.save(trait);

		const version = traitVersions.create({
			trait,
			versionNumber: 1,
			isLatest: true,
			isPublished: body.publishNow,
			rulesText: body.rulesText,
			effectPayload: body.effectPayload,
		});
		await traitVersions.save(version);

		return { trait, version };
	});
}
