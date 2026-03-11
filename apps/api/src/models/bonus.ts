import {
	BeforeInsert,
	BeforeUpdate,
	ChildEntity,
	Column,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	TableInheritance,
} from "typeorm";
import { CurrencyBonusDetail } from "./bonus-details/currency";
import { Race } from "./race";
import { SkillBonusDetail } from "./bonus-details/skill";
import { ToolBonusDetail } from "./bonus-details/tool";
import { WeaponBonusDetail } from "./bonus-details/weapon";
import { ArmorBonusDetail } from "./bonus-details/armor";
import { LanguageBonusDetail } from "./bonus-details/language";
import { FeatBonusDetail } from "./bonus-details/feat";
import { FeatureBonusDetail } from "./bonus-details/feature";
import { EquipmentBonusDetail } from "./bonus-details/equipment";
import { AbilityScoreBonusDetail } from "./bonus-details/ability-score";
import { SavingThrowProficiencyDetail } from "./bonus-details/saving-throws";
import { DamageResistanceBonusDetail } from "./bonus-details/damage-resistance";
import { DamageImmunityBonusDetail } from "./bonus-details/damage-immunity";
import { ConditionImmunityBonusDetail } from "./bonus-details/condition-immunity";
import { SenseBonusDetail } from "./bonus-details/sense";
import { SpeedBonusDetail } from "./bonus-details/speed";

export enum BonusType {
	// Common types

	SKILL_PROFICIENCY = "skill_proficiency",
	TOOL_PROFICIENCY = "tool_proficiency",
	WEAPON_PROFICIENCY = "weapon_proficiency",
	ARMOR_PROFICIENCY = "armor_proficiency",
	LANGUAGE = "language",
	FEAT = "feat",
	FEATURE = "feature",

	// Background-specific types

	EQUIPMENT = "equipment",
	CURRENCY = "currency",

	// Race-specific types

	ABILITY_SCORE = "ability_score",
	SAVING_THROW_PROFICIENCY = "saving_throw_proficiency",
	DAMAGE_RESISTANCE = "damage_resistance",
	DAMAGE_IMMUNITY = "damage_immunity",
	CONDITION_IMMUNITY = "condition_immunity",
	SENSE = "sense", // e.g. darkvision
	SPEED = "speed", // swim speed, fly speed, etc.
}

@Entity()
@TableInheritance({ column: { type: "varchar", name: "type" } })
export class Bonus {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ type: "varchar", nullable: true })
	label!: string | null;

	@Column({ type: "int", nullable: true })
	quantity!: number | null;

	@ManyToOne(() => Race, (race) => race.bonuses, {
		nullable: true,
		onDelete: "CASCADE",
	})
	race!: Race | null;

	@ManyToOne(() => CharacterBackground, (background) => background.bonuses, {
		nullable: true,
		onDelete: "CASCADE",
	})
	background!: CharacterBackground | null;

	@ManyToOne(() => BonusPackage, (bonusPackage) => bonusPackage.bonuses, {
		nullable: true,
		onDelete: "CASCADE",
	})
	bonusPackage!: BonusPackage | null;

	@BeforeInsert()
	@BeforeUpdate()
	validateSource() {
		const sources = [this.race, this.background, this.bonusPackage];
		const nonNull = sources.filter((s) => s !== null && s !== undefined);
		if (nonNull.length !== 1) {
			throw new Error("A bonus must have exactly one source set");
		}
	}
}

@ChildEntity(BonusType.SKILL_PROFICIENCY)
export class SkillProficiencyBonus extends Bonus {
	@OneToMany(() => SkillBonusDetail, (s) => s.bonus, { cascade: true })
	skills!: SkillBonusDetail[];
}

@ChildEntity(BonusType.TOOL_PROFICIENCY)
export class ToolProficiencyBonus extends Bonus {
	@OneToMany(() => ToolBonusDetail, (t) => t.bonus, { cascade: true })
	tools!: ToolBonusDetail[];
}

@ChildEntity(BonusType.WEAPON_PROFICIENCY)
export class WeaponProficiencyBonus extends Bonus {
	@OneToMany(() => WeaponBonusDetail, (w) => w.bonus, { cascade: true })
	weapons!: WeaponBonusDetail[];
}

@ChildEntity(BonusType.ARMOR_PROFICIENCY)
export class ArmorProficiencyBonus extends Bonus {
	@OneToMany(() => ArmorBonusDetail, (a) => a.bonus, { cascade: true })
	armors!: ArmorBonusDetail[];
}

@ChildEntity(BonusType.LANGUAGE)
export class LanguageBonus extends Bonus {
	@OneToMany(() => LanguageBonusDetail, (l) => l.bonus, { cascade: true })
	languages!: LanguageBonusDetail[];
}

@ChildEntity(BonusType.FEAT)
export class FeatBonus extends Bonus {
	@OneToMany(() => FeatBonusDetail, (f) => f.bonus, { cascade: true })
	feats!: FeatBonusDetail[];
}

@ChildEntity(BonusType.FEATURE)
export class FeatureBonus extends Bonus {
	@OneToMany(() => FeatureBonusDetail, (f) => f.bonus, { cascade: true })
	features!: FeatureBonusDetail[];
}

@ChildEntity(BonusType.EQUIPMENT)
export class EquipmentBonus extends Bonus {
	@OneToMany(() => EquipmentBonusDetail, (e) => e.bonus, { cascade: true })
	equipment!: EquipmentBonusDetail[];
}

@ChildEntity(BonusType.CURRENCY)
export class CurrencyBonus extends Bonus {
	@OneToMany(() => CurrencyBonusDetail, (c) => c.currency, { cascade: true })
	currency!: CurrencyBonusDetail[];

	declare quantity: null; // override to always be null since currency bonuses are always fixed
}

@ChildEntity(BonusType.ABILITY_SCORE)
export class AbilityScoreBonus extends Bonus {
	@OneToMany(() => AbilityScoreBonusDetail, (a) => a.bonus, { cascade: true })
	abilityScores!: AbilityScoreBonusDetail[];
}

@ChildEntity(BonusType.SAVING_THROW_PROFICIENCY)
export class SavingThrowProficiencyBonus extends Bonus {
	@OneToMany(() => SavingThrowProficiencyDetail, (s) => s.bonus, {
		cascade: true,
	})
	savingThrows!: SavingThrowProficiencyDetail[];
}

@ChildEntity(BonusType.DAMAGE_RESISTANCE)
export class DamageResistanceBonus extends Bonus {
	@OneToMany(() => DamageResistanceBonusDetail, (d) => d.bonus, {
		cascade: true,
	})
	damageResistances!: DamageResistanceBonusDetail[];
}

@ChildEntity(BonusType.DAMAGE_IMMUNITY)
export class DamageImmunityBonus extends Bonus {
	@OneToMany(() => DamageImmunityBonusDetail, (d) => d.bonus, { cascade: true })
	damageImmunities!: DamageImmunityBonusDetail[];
}

@ChildEntity(BonusType.CONDITION_IMMUNITY)
export class ConditionImmunityBonus extends Bonus {
	@OneToMany(() => ConditionImmunityBonusDetail, (c) => c.bonus, {
		cascade: true,
	})
	conditionImmunities!: ConditionImmunityBonusDetail[];
}

@ChildEntity(BonusType.SENSE)
export class SenseBonus extends Bonus {
	@OneToMany(() => SenseBonusDetail, (s) => s.bonus, { cascade: true })
	senses!: SenseBonusDetail[];
}

@ChildEntity(BonusType.SPEED)
export class SpeedBonus extends Bonus {
	@OneToMany(() => SpeedBonusDetail, (s) => s.bonus, { cascade: true })
	speeds!: SpeedBonusDetail[];
}
