import {
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryColumn,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { User } from "./user";

@Entity({ name: "user_auth_sessions" })
@Index("idx_auth_sessions_user", ["user"])
@Index("idx_auth_sessions_expires_at", ["expiresAt"])
@Index("idx_auth_sessions_revoked_at", ["revokedAt"])
@Index("idx_auth_sessions_active", ["user", "revokedAt", "expiresAt"])
export class UserAuthSession {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
	@JoinColumn({ name: "user_discord_id", referencedColumnName: "discordId" })
	user!: User;

	@Column({ type: "varchar", length: 128, unique: true })
	sessionId!: string;

	@Column({ type: "text", nullable: true })
	accessTokenEncrypted!: string | null;

	@Column({ type: "timestamptz", nullable: true })
	accessTokenExpiresAt!: Date | null;

	@Column({ type: "text", nullable: true })
	refreshTokenEncrypted!: string | null;

	@Column({ type: "timestamptz", nullable: true })
	expiresAt!: Date | null;

	@Column({ type: "timestamptz", nullable: true })
	lastUsedAt!: Date | null;

	@Column({ type: "timestamptz", nullable: true })
	revokedAt!: Date | null;

	@Column({ type: "varchar", length: 255, nullable: true })
	revokeReason!: string | null;

	@CreateDateColumn({ type: "timestamptz" })
	createdAt!: Date;

	@UpdateDateColumn({ type: "timestamptz" })
	updatedAt!: Date;

	@Column({ type: "int", nullable: false })
	encryptionKeyVersion!: number;
}
