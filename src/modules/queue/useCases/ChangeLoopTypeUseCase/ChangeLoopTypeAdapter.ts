import { UseCaseAdapter } from "@core";
import { LoopType } from "@modules/queue/entities/Queue";
import Joi from "joi";

export interface ChangeLoopTypeParams {
	guildId: string;
	loopType?: LoopType;
}

export class ChangeLoopTypeAdapter extends UseCaseAdapter<ChangeLoopTypeParams> {
	constructor(params: Partial<ChangeLoopTypeParams>) {
		super(params);
	}

	static SCHEMA = Joi.object<ChangeLoopTypeParams>({
		guildId: Joi.string().optional(),
		loopType: Joi.string().valid(...Object.values(LoopType)),
	}).required();
}
