import { BaseGuildVoiceChannelDto } from "@modules/discord/dto/BaseGuildVoiceChannelDto";
import { Exclude, Expose, plainToInstance, Type } from "class-transformer";
import { LoopType, Queue } from "../entities/Queue";
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

	@Expose()
	@Type(() => BaseGuildVoiceChannelDto)
	public voiceChannel!: BaseGuildVoiceChannelDto;

	public static create(entity: Queue): QueueDto {
		return plainToInstance(QueueDto, entity);
	}
}
