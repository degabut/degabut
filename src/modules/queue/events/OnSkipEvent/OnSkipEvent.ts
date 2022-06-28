import { EventHandler } from "@core";
import { Queue } from "@modules/queue/entities/Queue";
import { Track } from "@modules/queue/entities/Track";
import { MessageEmbed } from "discord.js";
import { injectable } from "tsyringe";

type Data = {
	track: Track;
	queue: Queue;
	skippedBy: string;
};

@injectable()
export class OnSkipEvent extends EventHandler<Data> {
	public async run({ queue, track, skippedBy }: Data): Promise<void> {
		const embed = new MessageEmbed({
			description: `⏭ **<@!${skippedBy}> skipped ${track.video.title}**`,
		});

		await queue.textChannel.send({
			embeds: [embed],
		});
	}
}
