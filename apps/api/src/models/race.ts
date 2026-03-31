import { Column, Entity, Index, OneToMany } from "typeorm";
import { BaseContentEntity } from "./base-content-entity";
import { Character } from "./character";

export enum CreatureSize {
	TINY = "tiny",
	SMALL = "small",
	MEDIUM = "medium",
	LARGE = "large",
	HUGE = "huge",
	GARGANTUAN = "gargantuan",
}

@Entity({ name: "races" })
@Index("idx_races_name", ["name"])
@Index("idx_races_visibility", ["isPublic", "sourceType"])
export class Race extends BaseContentEntity {
	@Column({ type: "enum", enum: CreatureSize, default: CreatureSize.MEDIUM })
	size!: CreatureSize;

	@Column({ type: "int", default: 30 })
	baseSpeed!: number;

	@OneToMany(() => Character, (character) => character.race)
	characters!: Character[];
}
