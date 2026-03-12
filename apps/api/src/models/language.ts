import { Entity, ManyToOne, Column, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { GameSystem } from "./game-system";

export enum LanguageRarity {
	STANDARD = "standard", // languages that are commonly known and widely spoken
	EXOTIC = "exotic", // languages that are rare and typically only spoken by specific groups or in specific regions
	ANCIENT = "ancient", // languages that are no longer spoken and are only known through historical records
}

@Entity()
export class Language {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ type: "varchar", nullable: false })
	name!: string;

	@Column({ type: "boolean", default: false })
	isPublic!: boolean;

	@ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
	author!: User | null;

	@Column({
		type: "enum",
		enum: LanguageRarity,
		default: LanguageRarity.STANDARD,
	})
	rarity!: LanguageRarity;

	@Column({ type: "boolean", default: true })
	hasWrittenForm!: boolean;

	@Column({ type: "text", nullable: true })
	description!: string | null;

	@Column({ type: "boolean", default: false })
	isHomebrew!: boolean;

	@ManyToOne(() => GameSystem, { nullable: true, onDelete: "SET NULL" })
	gameSystem!: GameSystem | null;

	// isSecret references whether the language can be granted through normal language bonuses.
	@Column({ type: "boolean", default: false })
	isSecret!: boolean;
}
