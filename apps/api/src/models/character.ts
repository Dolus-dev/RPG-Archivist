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
import { Campaign } from "./campaign";
import { CharacterBackground } from "./character-background";

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

	@Column({
		type: "enum",
		enum: [
			`lawful-good`,
			`neutral-good`,
			`chaotic-good`,
			`lawful-neutral`,
			`true-neutral`,
			`chaotic-neutral`,
			`lawful-evil`,
			`neutral-evil`,
			`chaotic-evil`,
		],
		nullable: true,
	})
	alignment!: string | null;

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

	@Column({ type: "boolean", default: false })
	isPublic!: boolean;
}
