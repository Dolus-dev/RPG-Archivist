import {
	Column,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from "typeorm";
import { Character } from "./character";
import { User } from "./user";
import { BackgroundGrant } from "./background-grants";
import { BackgroundGrantChoiceGroup } from "./background-grant-choice-group";

@Entity()
export class CharacterBackground {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ type: "text" })
	name!: string;

	@Column({ type: "text", nullable: true })
	description!: string | null;

	@Column({ type: "enum", enum: ["official", "homebrew"], default: "homebrew" })
	source!: string;

	@ManyToOne(() => User, (author) => author.characters, {
		nullable: false,
		onDelete: "CASCADE",
	})
	author!: User;

	@Column({ type: "boolean", default: false })
	isPublic!: boolean;

	@OneToMany(() => Character, (character) => character.background)
	characters!: Character[];

	@OneToMany(() => BackgroundGrant, (grant) => grant.background, {
		cascade: true,
	})
	grants!: BackgroundGrant[];

	@OneToMany(() => BackgroundGrantChoiceGroup, (group) => group.background, {
		cascade: true,
	})
	choiceGroups!: BackgroundGrantChoiceGroup[];
}
