import {
	Column,
	Entity,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryColumn,
	PrimaryGeneratedColumn,
} from "typeorm";
import { Guild } from "./guild";
import { User } from "./user";
import { Character } from "./character";
import { GameSystem } from "./game-system";

export enum ProgressionType {
	XP = "xp",
	MILESTONE = "milestone",
	CUSTOM = "custom",
}

@Entity()
export class Campaign {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => Guild, (guild) => guild.campaigns)
	guild!: Guild;

	@ManyToMany(() => User, (user) => user.gmCampaigns)
	@JoinTable({ name: "campaign_gamemasters" })
	gameMasters!: User[];

	@ManyToMany(() => User, (user) => user.playerCampaigns)
	@JoinTable({ name: "campaign_players" })
	players!: User[];

	@ManyToMany(() => Character, (character) => character.campaigns)
	@JoinTable({ name: "campaign_characters" })
	characters!: Character[];

	@Column({
		type: "enum",
		enum: ProgressionType,
		default: ProgressionType.MILESTONE,
	})
	progressionType!: ProgressionType;

	@ManyToOne(() => GameSystem, { nullable: false, onDelete: "RESTRICT" })
	gameSystem!: GameSystem;

	@Column({ type: "boolean", default: false })
	isPublic!: boolean;
}
