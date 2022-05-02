import { EventHandler } from "@core";
import { Queue } from "@modules/queue/domain/Queue";
import { Track } from "@modules/queue/domain/Track";
import { injectable } from "tsyringe";

type Data = {
	track: Track;
	queue: Queue;
};
@injectable()
export class OnTrackAddEvent extends EventHandler<Data> {
	public async run({ queue, track }: Data): Promise<void> {
		// TODO implement
		// console.log({ params, id: value.id });
	}
}
