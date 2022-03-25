import { EventHandler } from "@core";
import { AutoAddTrackUseCase, Queue } from "@modules/queue";
import { inject, injectable } from "tsyringe";

type Data = Queue;

@injectable()
export class OnTrackEndEvent extends EventHandler<Data> {
	constructor(@inject(AutoAddTrackUseCase) private autoAddTrack: AutoAddTrackUseCase) {
		super();
	}

	public async run(queue: Data): Promise<void> {
		await this.autoAddTrack.execute({ queue });
	}
}
