import {
	BeforeInsert,
	BeforeUpdate,
	Column,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
} from "typeorm";
import { AbilityScoreBonus } from "../bonus";

export enum AbilityScoreType {
	STR = "STR",
	DEX = "DEX",
	CON = "CON",
	INT = "INT",
	WIS = "WIS",
	CHA = "CHA",
}

@Entity()
export class AbilityScoreBonusDetail {
	@PrimaryGeneratedColumn("uuid")
	id!: string;
	@ManyToOne(() => AbilityScoreBonus, (b) => b.abilityScores, {
		onDelete: "CASCADE",
	})
	bonus!: AbilityScoreBonus;

	@Column({ type: "enum", enum: AbilityScoreType })
	abilityScore!: AbilityScoreType;

	@Column({ type: "int", default: 0 })
	modifier!: number;

	@BeforeInsert()
	@BeforeUpdate()
	validateModifier() {
		if (this.modifier < -5 || this.modifier > 10) {
			throw new Error("Ability score modifier must be between -5 and +10");
		}
		if (this.modifier === 0) {
			throw new Error("Ability score modifier cannot be 0");
		}
	}
}
