import { Exclude, Expose, plainToInstance } from "class-transformer";
import { Track } from "../domain/Track";

@Exclude()
export class TrackDto {
	@Expose()
	public id!: string;

	@Expose()
	public title!: string;

	public static create(Track: Track): TrackDto {
		return plainToInstance(TrackDto, Track);
	}
}
