import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class GameSystem {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ type: "varchar", unique: true })
	name!: string; // e.g. "D&D 5e", "Star Wars 5e",

	@Column({ type: "varchar", nullable: true })
	abbreviation!: string | null; // e.g. "SW5e", "DND5e"

	@Column({ type: "text", nullable: true })
	description!: string | null;
}
