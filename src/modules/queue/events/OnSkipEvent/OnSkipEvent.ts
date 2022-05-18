import { EventHandler } from "@core";
import { Queue } from "@modules/queue/domain/Queue";
import { Track } from "@modules/queue/domain/Track";
import { injectable } from "tsyringe";

type Data = {
	track: Track;
	queue: Queue;
};

@injectable()
export class OnSkipEvent extends EventHandler<Data> {
	public async run({ queue, track }: Data): Promise<void> {
		await queue.textChannel.send(`⏭ **Skipping ${track.video.title}**`);
	}
}
