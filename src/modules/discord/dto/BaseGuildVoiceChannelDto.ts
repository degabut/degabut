import { CollectionType } from "@utils";
import { Exclude, Expose, plainToInstance } from "class-transformer";
import { BaseGuildVoiceChannel } from "discord.js";
import { GuildMemberDto } from "./GuildMemberDto";

@Exclude()
export class BaseGuildVoiceChannelDto {
	@Expose()
	public id!: string;

	@Expose()
	public name!: string;

	@Expose()
	@CollectionType(GuildMemberDto)
	public members!: GuildMemberDto[];

	public static create(entity: BaseGuildVoiceChannel): BaseGuildVoiceChannelDto {
		return plainToInstance(BaseGuildVoiceChannelDto, entity);
	}
}
