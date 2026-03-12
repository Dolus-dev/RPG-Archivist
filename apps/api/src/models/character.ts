import {
	Column,
	Entity,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user";
import { Campaign, ProgressionType } from "./campaign";
import { CharacterBackground } from "./character-background";
import { GameSystem } from "./game-system";

export enum Alignment {
	LAWFUL_GOOD = "lawful-good",
	NEUTRAL_GOOD = "neutral-good",
	CHAOTIC_GOOD = "chaotic-good",
	LAWFUL_NEUTRAL = "lawful-neutral",
	TRUE_NEUTRAL = "true-neutral",
	CHAOTIC_NEUTRAL = "chaotic-neutral",
	LAWFUL_EVIL = "lawful-evil",
	NEUTRAL_EVIL = "neutral-evil",
	CHAOTIC_EVIL = "chaotic-evil",
}

@Entity()
export class Character {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => User, (user) => user.characters, {
		nullable: false,
		onDelete: "CASCADE",
	})
	author!: User;

	@Column({ type: "enum", enum: ["npc", "pc"], default: "pc" })
	kind!: string;

	@ManyToMany(() => Campaign, (campaign) => campaign.heroes, {
		nullable: true,
		onDelete: "SET NULL",
	})
	@JoinTable({ name: "character_campaigns" })
	campaigns!: Campaign[];

	@Column({ type: "varchar", nullable: false })
	name!: string;

	@Column({ type: "int", default: 1 })
	level!: number;

	@Column({ type: "int", default: 0, nullable: true })
	experiencePoints!: number | null;

	@Column({
		type: "enum",
		enum: Alignment,
	})
	alignment!: Alignment;

	@ManyToOne(() => Races, (race) => race.characters, {
		nullable: true,
		onDelete: "SET NULL",
	})
	race!: Races;

	@OneToOne(() => AbilityScores, (abilityScores) => abilityScores.character, {
		nullable: true,
		onDelete: "SET NULL",
	})
	abilityScores!: AbilityScores;

	@ManyToOne(() => CharacterBackground, (background) => background.character)
	background!: CharacterBackground;

	@OneToMany(() => CharacterClass, (playerClass) => playerClass.character)
	classes!: CharacterClass[];

	@Column({ type: "text", nullable: true })
	appearance!: string | null;

	@Column({ type: "text", nullable: true })
	personality!: string | null;

	@Column({ type: "text", nullable: true })
	ideals!: string | null;

	@Column({ type: "text", nullable: true })
	bonds!: string | null;

	@Column({ type: "text", nullable: true })
	flaws!: string | null;

	@Column({ type: "text", nullable: true })
	backstory!: string | null;

	@Column({ type: "decimal", precision: 4, scale: 2, nullable: true })
	challengeRating!: number | null;

	// This is overridden if the character participates in a public campaign.
	// Other members of the campaign where this character is participating in can see it as well.
	@Column({ type: "boolean", default: false })
	isPublic!: boolean;

	@ManyToOne(() => GameSystem, { nullable: false, onDelete: "RESTRICT" })
	gameSystem!: GameSystem;

	// This is the preferred progression type for this character. It can be overridden by the campaign's progression type if the character participates in a campaign.
	@Column({
		type: "enum",
		enum: ProgressionType,
		default: ProgressionType.XP,
	})
	preferredProgressionType!: ProgressionType;
}
