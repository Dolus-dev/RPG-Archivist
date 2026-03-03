import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BackgroundGrant } from "./background-grants";
import { Language } from "./language";

@Entity()
export class BackgroundLanguageGrant {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => BackgroundGrant, (grant) => grant.languages, {
		nullable: false,
		onDelete: "CASCADE",
	})
	grant!: BackgroundGrant;

	@ManyToOne(() => Language, {
		nullable: false,
		onDelete: "CASCADE",
	})
	language!: Language;
}
