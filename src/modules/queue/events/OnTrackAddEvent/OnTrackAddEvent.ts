import { EventHandler } from "@core";
import { AddTrackParams, AddTrackResponse } from "@modules/queue/useCases/AddTrackUseCase";
import { injectable } from "tsyringe";

type Data = {
	params: AddTrackParams;
	value: AddTrackResponse;
};

@injectable()
export class OnTrackAddEvent extends EventHandler<Data> {
	public async run({ params, value }: Data): Promise<void> {
		// TODO implement
		// console.log({ params, id: value.id });
	}
}
