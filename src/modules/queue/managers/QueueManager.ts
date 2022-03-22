import { joinVoiceChannel } from "@discordjs/voice";
import { BaseGuildTextChannel, BaseGuildVoiceChannel } from "discord.js";
import { injectable } from "tsyringe";
import { Queue } from "../domain";

type CreateProps = {
	voiceChannel: BaseGuildVoiceChannel;
	textChannel: BaseGuildTextChannel;
	guildId: string;
};

@injectable()
export class QueueManager {
	private queues: Map<string, Queue> = new Map();

	public get(guildId: string): Queue | undefined {
		return this.queues.get(guildId);
	}

	public set(guildId: string, queue: Queue): void {
		this.queues.set(guildId, queue);
	}

	public delete(guildId: string): void {
		this.queues.delete(guildId);
	}

	public create({ guildId, voiceChannel, textChannel }: CreateProps): Queue {
		const queue = new Queue({
			voiceConnection: joinVoiceChannel({
				channelId: voiceChannel.id,
				guildId: voiceChannel.guild.id,
				adapterCreator: voiceChannel.guild.voiceAdapterCreator,
			}),
			voiceChannel,
			textChannel,
		});

		queue.on("autoplay", () => {
			// if (queue) this.autoAddTrack.execute({ queue });
		});

		this.set(guildId, queue);
		return queue;
	}
}
