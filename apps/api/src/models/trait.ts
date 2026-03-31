import {
	Column,
	Entity,
	Index,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	Unique,
	JoinColumn,
	BeforeInsert,
	BeforeUpdate,
} from "typeorm";
import * as z from "zod";
import { BaseContentEntity } from "./base-content-entity";
import { Race } from "./race";
import { Character } from "./character";

export enum TraitGrantSourceType {
	RACE = "race",
	CLASS = "class",
	BACKGROUND = "background",
	FEAT = "feat",
	MANUAL = "manual",
}
export enum AbilitiesEnum {
	STR = "str",
	DEX = "dex",
	CON = "con",
	INT = "int",
	WIS = "wis",
	CHA = "cha",
}

export enum ProficienciesEnum {
	ARMOR = "armor",
	WEAPON = "weapon",
	TOOL = "tool",
	SKILL = "skill",
	SAVING_THROW = "saving_throw",
	LANGUAGE = "language",
}

const AbilityEnum = z.enum(AbilitiesEnum);
const ProficiencyEnum = z.enum(ProficienciesEnum);

const SenseEffectSchema = z
	.object({
		kind: z.literal("sense"),
		senseKey: z.string().min(1), // ex. darkvision, tremorsense, abyssal_sight
		displayName: z.string().min(1), // ex. Darkvision, Tremorsense, Abyssal Sight
		description: z.string().min(1),
		rangeFeet: z.number().int().positive().optional(),
	})
	.strict();

const AbilityBoostEffectSchema = z
	.object({
		kind: z.literal("ability_boost"),
		ability: AbilityEnum,
		amount: z.number().int().positive(),
		description: z.string().min(1).optional().nullable(),
	})
	.strict();

const ProficiencyEffectSchema = z
	.object({
		kind: z.literal("proficiency"),
		proficiency: ProficiencyEnum,
		key: z.string().min(1),
		description: z.string().min(1).optional().nullable(),
	})
	.strict();

const RestrictionEffectSchema = z
	.object({
		kind: z.literal("restriction"),
		description: z.string().min(1),
	})
	.strict();

const ResistanceEffectSchema = z.object({
	kind: z.literal("resistance"),
	damageType: z.string().min(1),
	description: z.string().min(1).optional().nullable(),
});

export const EffectSchema = z.discriminatedUnion("kind", [
	SenseEffectSchema,
	AbilityBoostEffectSchema,
	ProficiencyEffectSchema,
	RestrictionEffectSchema,
	ResistanceEffectSchema,
]);

export const EffectPayloadSchema = z
	.object({
		schemaVersion: z.literal(1),
		effects: z.array(EffectSchema),
		notes: z.string().min(1).optional().nullable(),
	})
	.strict();

export type EffectPayload = z.infer<typeof EffectPayloadSchema>;

@Entity({ name: "traits" })
@Index("idx_traits_name", ["name"])
@Index("idx_traits_visibility", ["isPublic", "sourceType"])
export class Trait extends BaseContentEntity {
	@OneToMany(() => TraitVersion, (traitVersion) => traitVersion.trait)
	versions!: TraitVersion[];
}

@Entity({ name: "trait_versions" })
@Unique("uq_trait_version_number", ["trait", "versionNumber"])
@Index("idx_trait_versions_latest", ["trait", "isLatest"])
export class TraitVersion {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => Trait, (trait) => trait.versions, {
		nullable: false,
		onDelete: "CASCADE",
	})
	@JoinColumn({ name: "traitId" })
	trait!: Trait;

	@Column({ type: "int" })
	versionNumber!: number;

	@Column({ type: "boolean", default: false })
	isLatest!: boolean;

	@Column({ type: "boolean", default: false })
	isPublished!: boolean;

	@Column({ type: "text" })
	rulesText!: string;

	// flexible effect model for now
	@Column({ type: "jsonb", default: () => "'{}'" })
	effectPayload!: EffectPayload;

	@CreateDateColumn({ type: "timestamptz" })
	createdAt!: Date;

	@BeforeInsert()
	@BeforeUpdate()
	validateEffectPayload() {
		const parsed = EffectPayloadSchema.safeParse(this.effectPayload);
		if (!parsed.success) {
			const message = parsed.error.issues
				.map((i) => `${i.path.join(".")}: ${i.message}`)
				.join("; ");
			throw new Error(`Invalid effect payload: ${message}`);
		}

		this.effectPayload = parsed.data;
	}
}

@Entity({ name: "race_trait_links" })
@Unique("uq_race_trait_link", ["race", "traitVersion"])
export class RaceTraitLink {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => Race, { nullable: false, onDelete: "CASCADE" })
	@JoinColumn({ name: "raceId" })
	race!: Race;

	@ManyToOne(() => TraitVersion, { nullable: false, onDelete: "RESTRICT" })
	@JoinColumn({ name: "traitVersionId" })
	traitVersion!: TraitVersion;

	@Column({ type: "int", default: 1 })
	grantedAtLevel!: number;

	@Column({ type: "int", default: 0 })
	sortOrder!: number;

	@Column({ type: "text", nullable: true })
	overrideText!: string | null;
}

// mirror this pattern once Class/Background entities exist
@Entity({ name: "class_trait_links" })
export class ClassTraitLink {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	// @ManyToOne(() => Class, { nullable: false, onDelete: "CASCADE" })
	// @JoinColumn({ name: "classId" })
	// class!: Class;

	@ManyToOne(() => TraitVersion, { nullable: false, onDelete: "RESTRICT" })
	@JoinColumn({ name: "traitVersionId" })
	traitVersion!: TraitVersion;

	@Column({ type: "int", default: 1 })
	grantedAtLevel!: number;
}

@Entity({ name: "background_trait_links" })
export class BackgroundTraitLink {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	// @ManyToOne(() => Background, { nullable: false, onDelete: "CASCADE" })
	// @JoinColumn({ name: "backgroundId" })
	// background!: Background;

	@ManyToOne(() => TraitVersion, { nullable: false, onDelete: "RESTRICT" })
	@JoinColumn({ name: "traitVersionId" })
	traitVersion!: TraitVersion;
}

@Entity({ name: "character_trait_grants" })
@Index("idx_character_trait_grants_character", ["character"])
@Index("idx_character_trait_grants_source_type", ["sourceType"])
export class CharacterTraitGrant {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => Character, { nullable: false, onDelete: "CASCADE" })
	@JoinColumn({ name: "characterId" })
	character!: Character;

	@ManyToOne(() => Trait, { nullable: false, onDelete: "RESTRICT" })
	@JoinColumn({ name: "traitId" })
	trait!: Trait;

	@ManyToOne(() => TraitVersion, { nullable: false, onDelete: "RESTRICT" })
	@JoinColumn({ name: "traitVersionId" })
	traitVersion!: TraitVersion;

	@Column({
		type: "enum",
		enum: TraitGrantSourceType,
	})
	sourceType!: TraitGrantSourceType;

	// only one of these should be set, based on sourceType
	@ManyToOne(() => RaceTraitLink, { nullable: true, onDelete: "SET NULL" })
	@JoinColumn({ name: "raceTraitLinkId" })
	raceTraitLink!: RaceTraitLink | null;

	@ManyToOne(() => ClassTraitLink, { nullable: true, onDelete: "SET NULL" })
	@JoinColumn({ name: "classTraitLinkId" })
	classTraitLink!: ClassTraitLink | null;

	@ManyToOne(() => BackgroundTraitLink, {
		nullable: true,
		onDelete: "SET NULL",
	})
	@JoinColumn({ name: "backgroundTraitLinkId" })
	backgroundTraitLink!: BackgroundTraitLink | null;

	@Column({ type: "int", nullable: true })
	grantedAtLevel!: number | null;

	@Column({ type: "boolean", default: true })
	isActive!: boolean;

	// snapshot payload for stable rendering
	@Column({ type: "varchar", length: 120 })
	snapshotName!: string;

	@Column({ type: "text" })
	snapshotRulesText!: string;

	@Column({ type: "jsonb", default: () => "'{}'" })
	snapshotEffectPayload!: Record<string, unknown>;
	@CreateDateColumn({ type: "timestamptz" })
	capturedAt!: Date;
}
