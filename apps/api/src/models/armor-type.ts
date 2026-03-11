import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

@Entity()
export class ArmorType {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ type: "varchar", nullable: false, unique: false })
	name!: string;

	@Column({ type: "text", nullable: true })
	description!: string;

	@Column({ type: "boolean", default: false })
	isHomebrew!: boolean;

	@ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
	author!: User | null;

	@Column({ type: "boolean", default: false })
	isPublic!: boolean;
}
