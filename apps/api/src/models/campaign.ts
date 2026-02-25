import {
	Column,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryColumn,
	PrimaryGeneratedColumn,
} from "typeorm";
import { Guild } from "./guild";
import { User } from "./user";

@Entity()
export class Campaign {
	@PrimaryGeneratedColumn({ type: "number" })
	id!: number;

	@ManyToOne(() => Guild, (guild) => guild.campaigns)
	guild!: Guild;

	constructor() {}
}
