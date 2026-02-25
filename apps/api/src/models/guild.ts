import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Campaign } from "./campaign";

@Entity()
export class Guild {
	@PrimaryColumn({ type: "varchar", unique: true, nullable: false })
	id: string;

	@Column({ type: "varchar" })
	name: string;

	@OneToMany(() => Campaign, (campaign) => campaign.guild, { eager: false })
	campaigns!: Campaign[];

	constructor(id: string, name: string) {
		this.id = id;
		this.name = name;
	}
}
