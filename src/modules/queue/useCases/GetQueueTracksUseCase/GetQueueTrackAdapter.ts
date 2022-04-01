import { UseCaseAdapter } from "core/UseCaseAdapter";
import Joi from "joi";

export type GetQueueTracksParams = {
	guildId: string;
};

export class GetQueueTracksAdapter extends UseCaseAdapter<GetQueueTracksParams> {
	constructor(params: Partial<GetQueueTracksParams>) {
		super(params);
	}

	static SCHEMA = Joi.object<GetQueueTracksParams>({
		guildId: Joi.string().required(),
	}).required();
}
