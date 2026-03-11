import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SavingThrowProficiencyBonus } from "../bonus";
import { AbilityScoreType } from "./ability-score";

@Entity()
export class SavingThrowProficiencyDetail {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => SavingThrowProficiencyBonus, (b) => b.savingThrows, {
		onDelete: "CASCADE",
	})
	bonus!: SavingThrowProficiencyBonus;

	@Column({ type: "enum", enum: AbilityScoreType, nullable: false })
	proficiency!: AbilityScoreType;
}
