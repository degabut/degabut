import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice";
import { Queue } from "@modules/queue/entities/Queue";
import { BaseGuildTextChannel, BaseGuildVoiceChannel } from "discord.js";

type CreateProps = {
	voiceChannel: BaseGuildVoiceChannel;
	textChannel: BaseGuildTextChannel;
	guildId: string;
};

export class QueueRepository {
	private queues: Map<string, Queue> = new Map();

	public get(guildId: string): Queue | undefined {
		return this.queues.get(guildId);
	}

	public getByUserId(userId: string): Queue | undefined {
		const queues = [...this.queues.values()];
		return queues.find((q) => q.voiceChannel.members.has(userId));
	}

	public delete(guildId: string): void {
		this.queues.delete(guildId);
	}

	public create({ guildId, voiceChannel, textChannel }: CreateProps): Queue {
		const queue = new Queue({
			voiceConnection: joinVoiceChannel({
				channelId: voiceChannel.id,
				guildId: voiceChannel.guild.id,
				adapterCreator: voiceChannel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
			}),
			voiceChannel,
			textChannel,
		});

		this.queues.set(guildId, queue);
		return queue;
	}
}
