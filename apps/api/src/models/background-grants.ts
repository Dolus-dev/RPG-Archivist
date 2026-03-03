import {
	Column,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from "typeorm";
import { Character } from "./character";
import { CharacterBackground } from "./character-background";
import { BackgroundItemGrant } from "./background-item-grant";
import { BackgroundLanguageGrant } from "./background-language-grants";
import { BackgroundSkillGrant } from "./background-skill-grant";
import { BackgroundFeatGrant } from "./background-feat-grants";
import { BackgroundGrantChoiceGroup } from "./background-grant-choice-group";

export enum GrantType {
	SKILL_PROFICIENCY = "skill-proficiency",
	TOOL_PROFICIENCY = "tool-proficiency",
	WEAPON_PROFICIENCY = "weapon-proficiency",
	ARMOR_PROFICIENCY = "armor-proficiency",
	LANGUAGE = "language",
	EQUIPMENT = "equipment",
	GOLD = "gold",
	FEAT = "feat",
	FEATURE = "feature", // freeform text feature, like "Second Story Work" or "Criminal Contact"
}

export enum GrantSelectionType {
	FIXED = "fixed", // the grant specifies exactly what is granted
	CHOICE = "choice", // character picks from a list of options
}

@Entity()
export class BackgroundGrant {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	// Null if grant belongs to a choice group
	@ManyToOne(() => CharacterBackground, (background) => background.grants, {
		nullable: true,
		onDelete: "CASCADE",
	})
	background!: CharacterBackground | null;

	// Null if this is a fixed grant directly connected to the background
	@ManyToOne(() => BackgroundGrantChoiceGroup, (group) => group.options, {
		nullable: true,
		onDelete: "SET NULL",
	})
	choiceGroup!: BackgroundGrantChoiceGroup | null;

	@Column({ type: "varchar", nullable: true })
	label!: string | null; // e.g. "Skill Proficiency", "Equipment", etc. Only really necessary for grants with selectionType of "choice"

	@Column({ type: "enum", enum: GrantType })
	type!: GrantType;

	@Column({
		type: "enum",
		enum: GrantSelectionType,
		default: GrantSelectionType.FIXED,
	})
	selectionType!: GrantSelectionType;

	@Column({ type: "int", nullable: true })
	quantity!: number | null; // for fixed grants, how many of the granted item/option is granted (e.g. 2 languages)

	@OneToMany(() => BackgroundSkillGrant, (skill) => skill.grant, {
		nullable: true,
		onDelete: "SET NULL",
	})
	skills!: BackgroundSkillGrant[] | null; // if the grant is a skill proficiency, which skill is granted

	@OneToMany(() => BackgroundLanguageGrant, (language) => language.grant, {
		nullable: true,
		onDelete: "SET NULL",
	})
	languages!: BackgroundLanguageGrant[] | null; // if the grant is a language proficiency, which language is granted

	@OneToMany(() => BackgroundItemGrant, (item) => item.grant, {
		nullable: true,
		onDelete: "SET NULL",
	})
	items!: BackgroundItemGrant[] | null; // if the grant is an equipment item, which item is granted

	@OneToMany(() => BackgroundFeatGrant, (feat) => feat.grant, {
		nullable: true,
		onDelete: "SET NULL",
	})
	feats!: BackgroundFeatGrant[] | null; // if the grant is a feat, which feat is granted
}
