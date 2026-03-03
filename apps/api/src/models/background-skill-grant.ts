import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BackgroundGrant } from "./background-grants";
import { Skill } from "./skill";

@Entity()
export class BackgroundSkillGrant {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => BackgroundGrant, (grant) => grant.skills, {
		nullable: false,
		onDelete: "CASCADE",
	})
	grant!: BackgroundGrant;

	@ManyToOne(() => Skill, {
		nullable: false,
		onDelete: "CASCADE",
	})
	skill!: Skill;
}
