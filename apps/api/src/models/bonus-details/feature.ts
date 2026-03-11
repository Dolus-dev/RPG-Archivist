import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { FeatureBonus } from "../bonus";
import { Feature } from "../feature";

@Entity()
export class FeatureBonusDetail {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => FeatureBonus, (b) => b.features, {
		onDelete: "CASCADE",
	})
	bonus!: FeatureBonus;

	@ManyToOne(() => Feature, { nullable: false, onDelete: "CASCADE" })
	feature!: Feature;
}
