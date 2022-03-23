import { EventHandler, EventHandlerRunParams } from "@core";
import { AddTrackParams, AddTrackResponse } from "@modules/queue";
import { injectable } from "tsyringe";

type Data = EventHandlerRunParams<AddTrackParams, AddTrackResponse>;

@injectable()
export class OnTrackAddEvent extends EventHandler<AddTrackParams, AddTrackResponse> {
	public async run({ params, value }: Data): Promise<void> {
		// TODO implement
		// console.log({ params, id: value.id });
	}
}
