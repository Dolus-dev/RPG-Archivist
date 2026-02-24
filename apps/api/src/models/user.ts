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
