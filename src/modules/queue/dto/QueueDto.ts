import { Exclude, Expose, plainToInstance, Type } from "class-transformer";
import { LoopType, Queue } from "../domain/Queue";
import { TrackDto } from "./TrackDto";

@Exclude()
export class QueueDto {
	@Expose()
	@Type(() => TrackDto)
	public tracks!: TrackDto[];

	@Expose()
	@Type(() => TrackDto)
	public history!: TrackDto[];

	@Expose()
	public autoplay!: boolean;

	@Expose()
	public loopType!: LoopType;

	public static create(entity: Queue): QueueDto {
		return plainToInstance(QueueDto, entity);
	}
}
