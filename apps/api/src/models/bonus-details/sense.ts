import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SenseBonus } from "../bonus";

@Entity()
export class SenseBonusDetail {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => SenseBonus, (b) => b.senses, {
		onDelete: "CASCADE",
	})
	bonus!: SenseBonus;

	@ManyToOne(() => Senses, { nullable: false, onDelete: "CASCADE" })
	senseType!: Senses;

	@Column({ type: "int", nullable: true })
	range!: number | null;
}
