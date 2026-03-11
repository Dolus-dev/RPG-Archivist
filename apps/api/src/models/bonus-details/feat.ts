import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { FeatBonus } from "../bonus";

@Entity()
export class FeatBonusDetail {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => FeatBonus, (b) => b.feats, {
		onDelete: "CASCADE",
	})
	bonus!: FeatBonus;

	@ManyToOne(() => Feat, { nullable: false, onDelete: "CASCADE" })
	feat!: Feat;
}
