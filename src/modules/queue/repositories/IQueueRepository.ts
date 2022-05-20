import { BaseGuildTextChannel, BaseGuildVoiceChannel } from "discord.js";
import { Queue } from "../entities/Queue";

type CreateProps = {
	voiceChannel: BaseGuildVoiceChannel;
	textChannel: BaseGuildTextChannel;
	guildId: string;
};

export interface IQueueRepository {
	get(guildId: string): Queue | undefined;
	getByUserId(userId: string): Queue | undefined;
	delete(guildId: string): void;
	create(props: CreateProps): Queue;
}
