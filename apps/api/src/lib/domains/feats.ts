import { EntityManager } from "typeorm";
import { DATABASE } from "../..";
import { Feat, FeatFilterMetadata } from "../../models/feat";
import { FeatPrerequisite } from "../../models/feat-prerequisites";

export function deriveFeatFilterMetadata(
	prereq: FeatPrerequisite | null,
): FeatFilterMetadata {
	if (!prereq) {
		return {
			hasPrerequisites: false,
			minCharacterLevel: null,
			requiresSpellcasting: false,
			requiresSpecificClass: false,
			requiresAbilityScore: false,
			requiresSpecificRace: false,
		};
	}

	const requiresAbilityScore =
		prereq.minStrength != null ||
		prereq.minDexterity != null ||
		prereq.minConstitution != null ||
		prereq.minIntelligence != null ||
		prereq.minWisdom != null ||
		prereq.minCharisma != null;

	const hasPrerequisites =
		prereq.minCharacterLevel != null ||
		prereq.requiresSpellcasting ||
		prereq.requiredClassKey != null ||
		prereq.requiredClassLevel != null ||
		prereq.requiredRace != null ||
		prereq.requiredFeat != null ||
		requiresAbilityScore;

	return {
		hasPrerequisites,
		minCharacterLevel: prereq.minCharacterLevel,
		requiresSpellcasting: prereq.requiresSpellcasting,
		requiresSpecificClass: prereq.requiredClassKey != null,
		requiresSpecificRace: prereq.requiredRace != null,
		requiresAbilityScore,
	};
}

type UpsertFeatInput = {
	featId?: string;
	name: string;
	description?: string | null;
	isHomebrew?: boolean;
	isPublic?: boolean;
	gameSystemId: string;
	authorId?: string | null;
};

type UpsertPrereqInput = {
	minCharacterLevel?: number | null;
	requiresSpellcasting?: boolean;
	requiredClassKey?: string | null;
	requiredClassLevel?: number | null;
	requiredRaceId?: string | null;
	requiredFeatId?: string | null;
	minStrength?: number | null;
	minDexterity?: number | null;
	minConstitution?: number | null;
	minIntelligence?: number | null;
	minWisdom?: number | null;
	minCharisma?: number | null;
	notes?: string | null;
};

export async function saveFeatWithPrerequisites(
	featInput: UpsertFeatInput,
	prereqInput: UpsertPrereqInput,
): Promise<Feat> {
	return DATABASE.manager.transaction(async (tx: EntityManager) => {
		const featRepo = tx.getRepository(Feat);
		const prereqRepo = tx.getRepository(FeatPrerequisite);

		let feat: Feat;

		if (featInput.featId) {
			feat = await featRepo.findOne({
				where: { id: featInput.featId },
				relations: { prerequisites: true },
			});
		} else {
			feat = featRepo.create();
		}

		feat.name = featInput.name;
		feat.description = featInput.description ?? null;
		feat.isHomebrew = featInput.isHomebrew ?? false;
		feat.isPublic = featInput.isPublic ?? false;
		feat.gameSystem = { id: featInput.gameSystemId } as any;
		feat.author = featInput.authorId
			? ({ id: featInput.authorId } as any)
			: null;

		let prereq: FeatPrerequisite | null = feat.prerequisites ?? null;

		if (prereqInput) {
			prereq = prereq ?? prereqRepo.create({ feat });

			prereq.minCharacterLevel = prereqInput.minCharacterLevel ?? null;
			prereq.requiresSpellcasting = prereqInput.requiresSpellcasting ?? false;
			prereq.requiredClassKey = prereqInput.requiredClassKey ?? null;
			prereq.requiredClassLevel = prereqInput.requiredClassLevel ?? null;
			prereq.requiredRace = prereqInput.requiredRaceId
				? ({ id: prereqInput.requiredRaceId } as any)
				: null;
			prereq.requiredFeat = prereqInput.requiredFeatId
				? ({ id: prereqInput.requiredFeatId } as any)
				: null;
			prereq.minStrength = prereqInput.minStrength ?? null;
			prereq.minDexterity = prereqInput.minDexterity ?? null;
			prereq.minConstitution = prereqInput.minConstitution ?? null;
			prereq.minIntelligence = prereqInput.minIntelligence ?? null;
			prereq.minWisdom = prereqInput.minWisdom ?? null;
			prereq.minCharisma = prereqInput.minCharisma ?? null;
			prereq.notes = prereqInput.notes ?? null;

			prereq = await prereqRepo.save(prereq);
			feat.prerequisites = prereq;
		} else if (prereq) {
			await prereqRepo.remove(prereq);
			prereq = null;
			feat.prerequisites = null;
		}

		const filter = deriveFeatFilterMetadata(prereq);
		feat.hasPrerequisites = filter.hasPrerequisites;
		feat.minCharacterLevel = filter.minCharacterLevel ?? null;
		feat.requiresSpellcasting = filter.requiresSpellcasting;
		feat.requiresSpecificClass = filter.requiresSpecificClass;
		feat.requiresSpecificRace = filter.requiresSpecificRace;
		feat.requiresAbilityScore = filter.requiresAbilityScore;
		feat.filterMetadata = filter;

		return featRepo.save(feat);
	});
}
