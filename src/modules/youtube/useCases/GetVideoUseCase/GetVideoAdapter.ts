import { UseCaseAdapter } from "core/UseCaseAdapter";
import Joi from "joi";

export type GetVideoParams = {
	id: string;
};

export class GetVideoAdapter extends UseCaseAdapter<GetVideoParams> {
	constructor(params: Partial<GetVideoParams>) {
		super(params);
	}

	static SCHEMA = Joi.object<GetVideoParams>({
		id: Joi.string().required(),
	}).required();
}
