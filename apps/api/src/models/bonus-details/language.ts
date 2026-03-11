import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { LanguageBonus } from "../bonus";

@Entity()
export class LanguageBonusDetail {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => LanguageBonus, (b) => b.languages, {
		onDelete: "CASCADE",
	})
	bonus!: LanguageBonus;

	@ManyToOne(() => Language, { nullable: false, onDelete: "CASCADE" })
	language!: Language;
}
