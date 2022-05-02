import { UseCaseAdapter } from "@core";
import Joi from "joi";

export type GetQueueTracksParams = {
	guildId: string;
	page: number;
	perPage: number;
};

export class GetQueueTracksAdapter extends UseCaseAdapter<GetQueueTracksParams> {
	constructor(params: Partial<GetQueueTracksParams>) {
		super(params);
	}

	static SCHEMA = Joi.object<GetQueueTracksParams>({
		guildId: Joi.string().required(),
		page: Joi.number().min(1).required().failover(1),
		perPage: Joi.number().min(100).required().failover(10),
	}).required();
}
