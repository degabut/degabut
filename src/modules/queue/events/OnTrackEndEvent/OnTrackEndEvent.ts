import { EventHandler } from "@core";
import { Queue } from "@modules/queue/domain/Queue";
import { AutoAddTrackUseCase } from "@modules/queue/useCases/AutoAddTrackUseCase/AutoAddTrackUseCase";
import { inject, injectable } from "tsyringe";

type Data = Queue;

@injectable()
export class OnTrackEndEvent extends EventHandler<Data> {
	constructor(@inject(AutoAddTrackUseCase) private autoAddTrack: AutoAddTrackUseCase) {
		super();
	}

	public async run(queue: Data): Promise<void> {
		if (queue.autoplay) {
			const lastSong = queue.history[0];
			if (lastSong) await this.autoAddTrack.execute({ queue });
		}
	}
}
