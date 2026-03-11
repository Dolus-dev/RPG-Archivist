import {
	BeforeInsert,
	BeforeUpdate,
	Column,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	TableInheritance,
	ChildEntity,
} from "typeorm";

import { Race } from "./race";
import { CharacterBackground } from "./character-background";
import { BonusPackage } from "./bonus-package";

@Entity()
export class BonusChoiceGroup {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ type: "varchar" })
	label!: string;

	@Column({ type: "int", default: 1 })
	choiceCount!: number;

	@ManyToOne(() => Race, (race) => race.bonusChoiceGroups, {
		nullable: true,
		onDelete: "CASCADE",
	})
	race!: Race | null;

	@ManyToOne(
		() => CharacterBackground,
		(background) => background.bonusChoiceGroups,
		{ nullable: true, onDelete: "CASCADE" },
	)
	background!: CharacterBackground | null;

	@ManyToOne(() => BonusPackage, (bonusPackage) => bonusPackage.choiceGroup, {
		nullable: true,
		onDelete: "CASCADE",
	})
	bonusPackage!: BonusPackage | null;

	@BeforeInsert()
	@BeforeUpdate()
	validateSource() {
		const sources = [this.race, this.background];
		const nonNull = sources.filter((s) => s !== null && s !== undefined);
		if (nonNull.length !== 1) {
			throw new Error("A bonus choice group must have exactly one source set");
		}
	}
}
