import {
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	Index,
	OneToMany,
	PrimaryColumn,
	UpdateDateColumn,
	ManyToMany,
} from "typeorm";
import { Character } from "./character";
import { Campaign } from "./campaign";

@Entity({ name: "users" })
@Index("idx_users_username", ["username"])
@Index("idx_users_is_active", ["isActive"])
export class User {
	@PrimaryColumn({ type: "varchar", unique: true, length: 32 })
	discordId!: string;

	@Column({ type: "varchar", length: 32 })
	username!: string;

	@Column({ type: "varchar", length: 32, nullable: true })
	displayName!: string | null;

	@Column({ type: "varchar", nullable: true, length: 128 })
	avatarHash!: string | null;

	@Column({ type: "boolean", default: true })
	isActive!: boolean;

	@OneToMany(() => Character, (character) => character.author)
	characters!: Character[];

	@ManyToMany(() => Campaign, (campaign) => campaign.gameMasters, {
		eager: false,
	})
	gmCampaigns!: Campaign[];

	@ManyToMany(() => Campaign, (campaign) => campaign.players, { eager: false })
	playerCampaigns!: Campaign[];

	@Column({ type: "timestamptz", nullable: true })
	lastLoginAt!: Date | null;

	@CreateDateColumn({ type: "timestamptz" })
	createdAt!: Date;

	@UpdateDateColumn({ type: "timestamptz" })
	updatedAt!: Date;

	@DeleteDateColumn({ type: "timestamptz", nullable: true })
	deletedAt!: Date | null;
}
