import { EventHandler } from "@core";
import { Queue } from "@modules/queue/entities/Queue";
import { Track } from "@modules/queue/entities/Track";
import { injectable } from "tsyringe";

type Data = {
	track: Track;
	queue: Queue;
	skippedBy: string;
};

@injectable()
export class OnSkipEvent extends EventHandler<Data> {
	public async run({ queue, track, skippedBy }: Data): Promise<void> {
		await queue.textChannel.send(`⏭ **<@!${skippedBy}> skipped ${track.video.title}**`);
	}
}
