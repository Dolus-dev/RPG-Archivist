import {
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	In,
	Index,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { User } from "./user";

export enum ContentSourceType {
	OFFICIAL = "official",
	HOMEBREW = "homebrew",
}

export abstract class BaseContentEntity {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ type: "varchar", length: 120 })
	name!: string;

	@Column({ type: "varchar", length: 160 })
	slug!: string;

	@Column({ type: "text", nullable: true })
	description!: string | null;

	@Column({
		type: "enum",
		enum: ContentSourceType,
		default: ContentSourceType.HOMEBREW,
	})
	@Index()
	sourceType!: ContentSourceType;

	@ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
	@Index()
	author!: User | null;

	@Column({ type: "boolean", default: false })
	@Index()
	isPublic!: boolean;

	@CreateDateColumn({ type: "timestamptz" })
	createdAt!: Date;

	@UpdateDateColumn({ type: "timestamptz" })
	updatedAt!: Date;

	@DeleteDateColumn({ type: "timestamptz", nullable: true })
	deletedAt!: Date | null;
}
