import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ArmorProficiencyBonus } from "../bonus";

@Entity()
export class ArmorBonusDetail {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => ArmorProficiencyBonus, (b) => b.armors, {
		onDelete: "CASCADE",
	})
	bonus!: ArmorProficiencyBonus;

	@ManyToOne(() => ArmorType, { nullable: false, onDelete: "CASCADE" })
	armorType!: ArmorType;
}
