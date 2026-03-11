import {
	BeforeInsert,
	BeforeUpdate,
	Column,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
} from "typeorm";
import { EquipmentBonus } from "../bonus";

@Entity()
export class EquipmentBonusDetail {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => EquipmentBonus, (b) => b.equipment, {
		onDelete: "CASCADE",
	})
	bonus!: EquipmentBonus;

	@ManyToOne(() => Item, { nullable: false, onDelete: "CASCADE" })
	item!: Item;

	@Column({ type: "int", default: 1 })
	quantity!: number;

	@BeforeInsert()
	@BeforeUpdate()
	validateQuantity() {
		if (this.quantity < 1) {
			throw new Error("Item quantity must be at least 1");
		}
	}
}
