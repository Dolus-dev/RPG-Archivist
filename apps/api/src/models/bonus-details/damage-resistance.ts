import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { DamageResistanceBonus } from "../bonus";

@Entity()
export class DamageResistanceBonusDetail {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => DamageResistanceBonus, (b) => b.damageResistances, {
		onDelete: "CASCADE",
	})
	bonus!: DamageResistanceBonus;

	@ManyToOne(() => DamageType, { nullable: false, onDelete: "CASCADE" })
	damageType: DamageType;
}
