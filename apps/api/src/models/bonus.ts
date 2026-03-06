import {
	ChildEntity,
	Column,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
	TableInheritance,
} from "typeorm";

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
}

@ChildEntity(BonusType.SKILL_PROFICIENCY)
export class SkillProficiencyBonus extends Bonus {
	@OneToMany(() => SkillProficiencyBonus, (s) => s.bonus, { cascade: true })
	skills!: SkillProficiencyDetail[];
}

@ChildEntity(BonusType.TOOL_PROFICIENCY)
export class ToolProficiencyBonus extends Bonus {
	@OneToMany(() => ToolProficiencyBonus, (t) => t.bonus, { cascade: true })
	tools!: ToolProficiencyDetail[];
}

@ChildEntity(BonusType.WEAPON_PROFICIENCY)
export class WeaponProficiencyBonus extends Bonus {
	@OneToMany(() => WeaponProficiencyBonus, (w) => w.bonus, { cascade: true })
	weapons!: WeaponProficiencyDetail[];
}

@ChildEntity(BonusType.ARMOR_PROFICIENCY)
export class ArmorProficiencyBonus extends Bonus {
	@OneToMany(() => ArmorProficiencyBonus, (a) => a.bonus, { cascade: true })
	armors!: ArmorProficiencyDetail[];
}

@ChildEntity(BonusType.LANGUAGE)
export class LanguageBonus extends Bonus {
	@OneToMany(() => LanguageBonus, (l) => l.bonus, { cascade: true })
	languages!: LanguageDetail[];
}

@ChildEntity(BonusType.FEAT)
export class FeatBonus extends Bonus {
	@OneToMany(() => FeatBonus, (f) => f.bonus, { cascade: true })
	feats!: FeatDetail[];
}

@ChildEntity(BonusType.FEATURE)
export class FeatureBonus extends Bonus {
	@OneToMany(() => FeatureBonus, (f) => f.bonus, { cascade: true })
	features!: FeatureDetail[];
}

@ChildEntity(BonusType.EQUIPMENT)
export class EquipmentBonus extends Bonus {
	@OneToMany(() => EquipmentBonus, (e) => e.bonus, { cascade: true })
	equipment!: EquipmentDetail[];
}

@ChildEntity(BonusType.CURRENCY)
export class CurrencyBonus extends Bonus {
	@OneToMany(() => CurrencyBonus, (c) => c.bonus, { cascade: true })
	currency!: CurrencyDetail[];
}

@ChildEntity(BonusType.ABILITY_SCORE)
export class AbilityScoreBonus extends Bonus {
	@OneToMany(() => AbilityScoreBonus, (a) => a.bonus, { cascade: true })
	abilityScores!: AbilityScoreDetail[];
}

@ChildEntity(BonusType.SAVING_THROW_PROFICIENCY)
export class SavingThrowProficiencyBonus extends Bonus {
	@OneToMany(() => SavingThrowProficiencyBonus, (s) => s.bonus, {
		cascade: true,
	})
	savingThrows!: SavingThrowProficiencyDetail[];
}

@ChildEntity(BonusType.DAMAGE_RESISTANCE)
export class DamageResistanceBonus extends Bonus {
	@OneToMany(() => DamageResistanceBonus, (d) => d.bonus, { cascade: true })
	damageResistances!: DamageResistanceDetail[];
}

@ChildEntity(BonusType.DAMAGE_IMMUNITY)
export class DamageImmunityBonus extends Bonus {
	@OneToMany(() => DamageImmunityBonus, (d) => d.bonus, { cascade: true })
	damageImmunities!: DamageImmunityDetail[];
}

@ChildEntity(BonusType.CONDITION_IMMUNITY)
export class ConditionImmunityBonus extends Bonus {
	@OneToMany(() => ConditionImmunityBonus, (c) => c.bonus, { cascade: true })
	conditionImmunities!: ConditionImmunityDetail[];
}

@ChildEntity(BonusType.SENSE)
export class SenseBonus extends Bonus {
	@OneToMany(() => SenseBonus, (s) => s.bonus, { cascade: true })
	senses!: SenseDetail[];
}

@ChildEntity(BonusType.SPEED)
export class SpeedBonus extends Bonus {
	@OneToMany(() => SpeedBonus, (s) => s.bonus, { cascade: true })
	speeds!: SpeedDetail[];
}
