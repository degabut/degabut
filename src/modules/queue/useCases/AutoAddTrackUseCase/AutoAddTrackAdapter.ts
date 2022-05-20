import { UseCaseAdapter } from "@core";
import { Queue } from "@modules/queue/entities/Queue";
import Joi from "joi";

export interface AutoAddTrackParams {
	queue: Queue;
}

export class AutoAddTrackAdapter extends UseCaseAdapter<AutoAddTrackParams> {
	constructor(params: Partial<AutoAddTrackParams>) {
		super(params);
	}

	static SCHEMA = Joi.object<AutoAddTrackParams>({
		queue: Joi.object().instance(Queue).required(),
	}).required();
}
