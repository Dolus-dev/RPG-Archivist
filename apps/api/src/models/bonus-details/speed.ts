import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SpeedBonus } from "../bonus";

export enum SpeedType {
	FLYING = "flying",
	WALKING = "walking",
	SWIMMING = "swimming",
	CLIMBING = "climbing",
}

@Entity()
export class SpeedBonusDetail {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => SpeedBonus, (b) => b.speeds, {
		onDelete: "CASCADE",
	})
	bonus!: SpeedBonus;

	@Column({ type: "enum", enum: SpeedType })
	speedType!: SpeedType;

	@Column({ type: "int", nullable: false })
	value!: number;
}
