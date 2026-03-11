import {
	Column,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from "typeorm";
import { Bonus } from "./bonus";
import { BonusChoiceGroup } from "./bonus-choice-group";

@Entity()
export class BonusPackage {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ type: "varchar", nullable: true })
	label!: string | null;

	@ManyToOne(() => BonusChoiceGroup, (group) => group.bonusPackage, {
		nullable: true,
		onDelete: "CASCADE",
	})
	choiceGroup!: BonusChoiceGroup | null;

	@OneToMany(() => Bonus, (bonus) => bonus.bonusPackage, { cascade: true })
	bonuses!: Bonus[];
}
