import { Exclude, Expose, plainToInstance, Type } from "class-transformer";
import { Queue } from "../domain";
import { TrackDto } from "./TrackDto";

@Exclude()
export class QueueDto {
	@Expose()
	@Type(() => TrackDto)
	public tracks!: TrackDto[];

	@Expose()
	@Type(() => TrackDto)
	public history!: TrackDto[];

	public static create(queue: Queue): QueueDto {
		return plainToInstance(QueueDto, queue);
	}
}
