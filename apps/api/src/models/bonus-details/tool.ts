import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ToolProficiencyBonus } from "../bonus";

@Entity()
export class ToolBonusDetail {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => ToolProficiencyBonus, (b) => b.tools, {
		onDelete: "CASCADE",
	})
	bonus!: ToolProficiencyBonus;

	@ManyToOne(() => Tool, { nullable: false, onDelete: "CASCADE" })
	tool!: Tool;
}
