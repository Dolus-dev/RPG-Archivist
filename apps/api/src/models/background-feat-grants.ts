import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BackgroundGrant } from "./background-grants";
import { Feat } from "./feat";

@Entity()
export class BackgroundFeatGrant {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => BackgroundGrant, (grant) => grant.feats, {
		nullable: false,
		onDelete: "CASCADE",
	})
	grant!: BackgroundGrant;

	@ManyToOne(() => Feat, {
		nullable: false,
		onDelete: "CASCADE",
	})
	feat!: Feat;
}
