import {
	Column,
	Entity,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
	Index,
	CreateDateColumn,
	UpdateDateColumn,
	DeleteDateColumn,
	JoinColumn,
} from "typeorm";
import { User } from "./user";
import { Campaign, ProgressionType } from "./campaign";
import { Race } from "./race";

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

export enum CharacterType {
	PlayerCharacter = "pc",
	NonPlayerCharacter = "npc",
}

@Entity({ name: "characters" })
@Index("idx_characters_name", ["name"])
@Index("idx_characters_is_public", ["isPublic"])
@Index("idx_characters_kind", ["kind"])
@Index("idx_characters_author", ["author"])
export class Character {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
	@JoinColumn({ name: "authorDiscordId", referencedColumnName: "discordId" })
	author!: User;

	@ManyToMany(() => Campaign, (campaign) => campaign.characters)
	campaigns!: Campaign[];

	@Column({ type: "varchar", length: 100 })
	name!: string;

	@Column({
		type: "enum",
		enum: CharacterType,
		default: CharacterType.PlayerCharacter,
	})
	kind!: CharacterType;

	@Column({ type: "int", default: 1 })
	level!: number;

	@ManyToOne(() => Race, { nullable: true, onDelete: "SET NULL" })
	@JoinColumn({ name: "raceId" })
	race!: Race | null;

	@Column({ type: "int", default: 0 })
	xp!: number;

	@Column({
		type: "enum",
		enum: ProgressionType,
		default: ProgressionType.XP,
	})
	preferredProgressionType!: ProgressionType;

	@Column({ type: "boolean", default: false })
	isPublic!: boolean;

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

	@CreateDateColumn({ type: "timestamptz" })
	createdAt!: Date;

	@UpdateDateColumn({ type: "timestamptz" })
	updatedAt!: Date;

	@DeleteDateColumn({ type: "timestamptz" })
	deletedAt!: Date | null;
}
