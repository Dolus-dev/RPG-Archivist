import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { WeaponProficiencyBonus } from "../bonus";
import { WeaponType } from "../weapon-type";

@Entity()
export class WeaponBonusDetail {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => WeaponProficiencyBonus, (b) => b.weapons, {
		onDelete: "CASCADE",
	})
	bonus!: WeaponProficiencyBonus;

	@ManyToOne(() => WeaponType, { nullable: false, onDelete: "CASCADE" })
	weaponType!: WeaponType;
}
