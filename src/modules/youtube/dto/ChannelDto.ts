import { Exclude, Expose, plainToInstance } from "class-transformer";
import { Channel } from "../domains/Channel";

@Exclude()
export class ChannelDto {
	@Expose()
	public id!: string;

	@Expose()
	public name!: string;

	@Expose()
	public thumbnail!: string | null;

	public static create(entity: Channel): ChannelDto {
		return plainToInstance(ChannelDto, entity);
	}
}
