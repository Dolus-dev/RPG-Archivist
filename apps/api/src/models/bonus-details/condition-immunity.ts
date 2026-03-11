import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ConditionImmunityBonus } from "../bonus";

@Entity()
export class ConditionImmunityBonusDetail {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => ConditionImmunityBonus, (b) => b.conditionImmunities, {
		onDelete: "CASCADE",
	})
	bonus!: ConditionImmunityBonus;

	@ManyToOne(() => ConditionType, { nullable: false, onDelete: "CASCADE" })
	conditionType!: ConditionType;
}
