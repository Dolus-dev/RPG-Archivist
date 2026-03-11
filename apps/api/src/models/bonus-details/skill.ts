import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SkillProficiencyBonus } from "../bonus";

@Entity()
export class SkillBonusDetail {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => SkillProficiencyBonus, (b) => b.skills, {
		onDelete: "CASCADE",
	})
	bonus!: SkillProficiencyBonus;

	@ManyToOne(() => Skill, { nullable: false, onDelete: "CASCADE" })
	skill!: Skill;
}
