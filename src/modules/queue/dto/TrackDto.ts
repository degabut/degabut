import { GuildMemberDto } from "@modules/discord/dto/GuildMemberDto";
import { VideoCompactDto } from "@modules/youtube/dto/VideoCompactDto";
import { Exclude, Expose, plainToInstance, Type } from "class-transformer";
import { Track } from "../entities/Track";

@Exclude()
export class TrackDto {
	@Expose()
	public id!: string;

	@Expose()
	@Type(() => VideoCompactDto)
	public video!: VideoCompactDto;

	@Expose()
	@Type(() => GuildMemberDto)
	public requestedBy!: GuildMemberDto;

	public static create(entity: Track): TrackDto {
		return plainToInstance(TrackDto, entity);
	}
}
