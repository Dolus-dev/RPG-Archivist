import {
	Column,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user";
import { GameSystem } from "./game-system";

export enum RaceSize {
	Tiny = "tiny",
	Small = "small",
	Medium = "medium",
	Large = "large",
	Huge = "huge",
	Gargantuan = "gargantuan",
}

export enum SourceType {
	Official = "official",
	Homebrew = "homebrew",
}

@Entity()
export class Race {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ unique: true })
	name!: string;

	@Column({ type: "int", nullable: false })
	speed!: number;

	@Column({ type: "enum", enum: RaceSize })
	size!: RaceSize;

	@Column({ type: "boolean", default: false })
	isMonster!: boolean;

	@Column({ type: "boolean", default: false })
	isPublic!: boolean;

	@Column({ type: "enum", enum: SourceType })
	source!: SourceType;

	@ManyToOne(() => User, (author) => author.races, {
		nullable: false,
		onDelete: "CASCADE",
	})
	author!: User;

	@ManyToOne(() => GameSystem, { nullable: false, onDelete: "RESTRICT" })
	gameSystem!: GameSystem;

	@OneToMany(() => RaceBonus, (bonus) => bonus.race)
	bonuses!: RaceBonus[];

	@OneToMany(() => RaceBonusChoiceGroup, (group) => group.race)
	bonusChoiceGroups!: RaceBonusChoiceGroup[];
}
