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
}
