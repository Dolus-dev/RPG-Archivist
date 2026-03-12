import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { GameSystem } from "./game-system";
@Entity()
export class WeaponType {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ type: "varchar", nullable: false, unique: false })
	name!: string;

	@Column({ type: "text", nullable: true })
	description!: string;

	@Column({ type: "boolean", default: false })
	isHomebrew!: boolean;

	@Column({ type: "boolean", default: false })
	isPublic!: boolean;

	@ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
	author!: User | null;

	@ManyToOne(() => GameSystem, { nullable: false, onDelete: "RESTRICT" })
	gameSystem!: GameSystem;
}
