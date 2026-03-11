import {
	BeforeInsert,
	BeforeUpdate,
	Column,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
} from "typeorm";
import { CurrencyBonus } from "../bonus";

export enum CurrencyType {
	Copper = "copper",
	Silver = "silver",
	Electrum = "electrum",
	Gold = "gold",
	Platinum = "platinum",
}

@Entity()
export class CurrencyBonusDetail {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => CurrencyBonus, (b) => b.currency, { onDelete: "CASCADE" })
	bonus!: CurrencyBonus;

	@Column({ type: "enum", enum: CurrencyType })
	denomination!: CurrencyType;

	@Column({ type: "int" })
	amount!: number;

	@BeforeInsert()
	@BeforeUpdate()
	validateAmount() {
		if (this.amount <= 0) {
			throw new Error("Amount must be a positive integer");
		}
	}
}
