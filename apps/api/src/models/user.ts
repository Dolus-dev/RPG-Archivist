import { Column, Entity, PrimaryColumn } from "typeorm";

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

	constructor(userData: {
		id: string;
		username: string;
		avatarHash: string | null;
		accessToken: string;
		refreshToken: string;
	}) {
		this.id = userData.id;
		this.username = userData.username;
		this.avatarHash = userData.avatarHash;
		this.accessToken = userData.accessToken;
		this.refreshToken = userData.refreshToken;
	}
}
