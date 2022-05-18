import { EventHandler } from "@core";
import { Queue } from "@modules/queue/domain/Queue";
import { injectable } from "tsyringe";

type Data = { queue: Queue };

@injectable()
export class OnTrackStartEvent extends EventHandler<Data> {
	public async run({ queue }: Data): Promise<void> {
		if (!queue.nowPlaying) return;

		await queue.textChannel.send({
			content: "🎶 **Now Playing**",
			embeds: [queue.nowPlaying.embed],
		});
	}
}
