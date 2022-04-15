import { Exclude, Expose, plainToInstance, Type } from "class-transformer";
import { Video } from "../domains/Video";
import { ChannelDto } from "./ChannelDto";
import { ThumbnailDto } from "./ThumbnailDto";
import { VideoCompactDto } from "./VideoCompactDto";

@Exclude()
export class VideoDto {
	@Expose()
	id!: string;

	@Expose()
	title!: string;

	@Expose()
	duration!: number;

	@Expose()
	@Type(() => ThumbnailDto)
	thumbnails!: ThumbnailDto[];

	@Expose()
	viewCount!: number;

	@Expose()
	@Type(() => ChannelDto)
	channel!: ChannelDto;

	@Expose()
	@Type(() => VideoCompactDto)
	related!: VideoCompactDto[];

	public static create(entity: Video): VideoDto {
		return plainToInstance(VideoDto, entity);
	}
}
