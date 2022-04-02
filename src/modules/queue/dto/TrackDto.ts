import { VideoCompactDto } from "@modules/youtube/dto/VideoCompactDto";
import { Exclude, Expose, plainToInstance, Type } from "class-transformer";
import { Track } from "../domain/Track";

@Exclude()
export class TrackDto {
	@Expose()
	public id!: string;

	@Expose()
	public title!: string;

	@Expose()
	@Type(() => VideoCompactDto)
	public video!: VideoCompactDto;

	public static create(Track: Track): TrackDto {
		return plainToInstance(TrackDto, Track);
	}
}
