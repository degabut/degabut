import { UseCaseAdapter } from "@core";
import Joi from "joi";

export type GetUserQueueParams = {
	userId: string;
};

export class GetUserQueueAdapter extends UseCaseAdapter<GetUserQueueParams> {
	constructor(params: Partial<GetUserQueueParams>) {
		super(params);
	}

	static SCHEMA = Joi.object<GetUserQueueParams>({
		userId: Joi.string().required(),
	}).required();
}
