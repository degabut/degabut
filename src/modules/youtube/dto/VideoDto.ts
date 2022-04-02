import { Exclude, Expose, plainToInstance } from "class-transformer";
import { Video } from "../domains/Video";

@Exclude()
export class VideoDto {
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

	public static create(entity: Video): VideoDto {
		return plainToInstance(VideoDto, entity);
	}
}
