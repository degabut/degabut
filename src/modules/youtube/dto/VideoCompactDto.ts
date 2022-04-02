import { Exclude, Expose, plainToInstance, Type } from "class-transformer";
import { VideoCompact } from "../domains/VideoCompact";
import { ChannelDto } from "./ChannelDto";

@Exclude()
export class VideoCompactDto {
	@Expose()
	id!: string;

	@Expose()
	title!: string;

	@Expose()
	duration!: number;

	@Expose()
	thumbnail!: string;

	@Expose()
	viewCount!: number;

	@Expose()
	@Type(() => ChannelDto)
	channel!: ChannelDto;

	public static create(entity: VideoCompact): VideoCompactDto {
		return plainToInstance(VideoCompactDto, entity);
	}
}
