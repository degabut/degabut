import { UseCaseAdapter } from "core/UseCaseAdapter";
import Joi from "joi";

export type DisconnectParams = {
	guildId: string;
};

export class DisconnectAdapter extends UseCaseAdapter<DisconnectParams> {
	constructor(params: Partial<DisconnectParams>) {
		super(params);
	}

	static SCHEMA = Joi.object<DisconnectParams>({
		guildId: Joi.string().required(),
	}).required();
}
