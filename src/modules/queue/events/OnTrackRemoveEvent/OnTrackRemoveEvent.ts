import { EventHandler } from "@core";
import { Queue } from "@modules/queue/entities/Queue";
import { Track } from "@modules/queue/entities/Track";
import { MessageEmbed } from "discord.js";
import { injectable } from "tsyringe";

type Data = {
	track: Track;
	queue: Queue;
	removedBy: string;
	isNowPlaying: boolean;
};

@injectable()
export class OnTrackRemoveEvent extends EventHandler<Data> {
	public async run({ queue, track, removedBy }: Data): Promise<void> {
		const embed = new MessageEmbed({
			description: `🚮 **<@!${removedBy}> removed ${track.video.title} from queue**`,
		});

		await queue.textChannel.send({
			embeds: [embed],
		});
	}
}
