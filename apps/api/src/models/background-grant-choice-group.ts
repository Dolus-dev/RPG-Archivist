import {
	Column,
	Entity,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from "typeorm";
import { CharacterBackground } from "./character-background";
import { BackgroundGrant } from "./background-grants";

@Entity()
export class BackgroundGrantChoiceGroup {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(
		() => CharacterBackground,
		(background) => background.choiceGroups,
		{
			nullable: false,
			onDelete: "CASCADE",
		},
	)
	background!: CharacterBackground;

	@Column({ type: "varchar", nullable: false })
	label!: string; // e.g. "Skill Proficiency", "Equipment", etc.

	@Column({ type: "int", nullable: false, default: 0 })
	skillChoiceCount!: number; // how many options the character gets to choose from this group

	@Column({ type: "int", nullable: false, default: 0 })
	itemChoiceCount!: number; // how many options the character gets to choose from this group

	@Column({ type: "int", nullable: false, default: 0 })
	featChoiceCount!: number; // how many options the character gets to choose from this group

	@Column({ type: "int", nullable: false, default: 0 })
	languageChoiceCount!: number; // how many options the character gets to choose from this group

	@OneToMany(() => BackgroundGrant, (grant) => grant.choiceGroup, {
		cascade: true,
	})
	options!: BackgroundGrant[] | null; // the grants that belong to this choice group
}
