import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { DamageImmunityBonus } from "../bonus";

@Entity()
export class DamageImmunityBonusDetail {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => DamageImmunityBonus, (b) => b.damageImmunities, {
		onDelete: "CASCADE",
	})
	bonus!: DamageImmunityBonus;

	@ManyToOne(() => DamageType, { nullable: false, onDelete: "CASCADE" })
	damageType!: DamageType;
}
