import { Column, Entity, ManyToMany, PrimaryColumn } from "typeorm";
import { Campaign } from "./campaign";

@Entity()
export class User {
	@PrimaryColumn({ type: "varchar", unique: true, nullable: false })
	id: string;

	@Column({ type: "varchar", nullable: false })
	username: string;

	@Column({ type: "varchar", nullable: true })
	avatarHash: string | null;
	@Column({ type: "varchar", nullable: false })
	accessToken: string;
	@Column({ type: "varchar", nullable: false })
	refreshToken: string;
	@ManyToMany(() => Campaign, (campaign) => campaign.gameMasters)
	gmCampaigns!: Campaign[];
	@ManyToMany(() => Campaign, (campaign) => campaign.players)
	playerCampaigns!: Campaign[];

	constructor(
		id: string,
		username: string,
		avatarHash: string | null,
		accessToken: string,
		refreshToken: string,
	) {
		this.id = id;
		this.username = username;
		this.avatarHash = avatarHash;
		this.accessToken = accessToken;
		this.refreshToken = refreshToken;
	}
}
