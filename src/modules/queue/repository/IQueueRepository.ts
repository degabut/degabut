import { BaseGuildTextChannel, BaseGuildVoiceChannel } from "discord.js";
import { Queue } from "../domain";

type CreateProps = {
	voiceChannel: BaseGuildVoiceChannel;
	textChannel: BaseGuildTextChannel;
	guildId: string;
};

export interface IQueueRepository {
	get(guildId: string): Queue | undefined;
	delete(guildId: string): void;
	create(props: CreateProps): Queue;
}