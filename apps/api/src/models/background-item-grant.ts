import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BackgroundGrant } from "./background-grants";
import { Item } from "./item";

@Entity()
export class BackgroundItemGrant {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => BackgroundGrant, (grant) => grant.items, {
		nullable: false,
		onDelete: "CASCADE",
	})
	grant!: BackgroundGrant;

	@ManyToOne(() => Item, {
		nullable: false,
		onDelete: "CASCADE",
	})
	item!: Item;

	@Column({ type: "int", default: 1 })
	quantity!: number;
}
