import Joi from "joi";
import { container } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { EventHandler } from "./EventHandler";

abstract class UseCase<ParamsSchema = unknown, Response = unknown> {
	protected abstract paramsSchema: Joi.ObjectSchema<ParamsSchema>;
	protected abstract run(params: ParamsSchema): Promise<Response>;
	protected emit?: constructor<EventHandler<ParamsSchema, Response>>[];
	protected awaitEmit?: boolean;

	public async execute(params: Partial<ParamsSchema>): Promise<Response> {
		const validatedParams = this.validate(params);
		const response = await this.run(validatedParams);

		if (this.emit) {
			const promises = this.emit.map((handler) => {
				const eventHandler = container.resolve(handler); // TODO better way to resolve?
				return eventHandler.run({
					params: validatedParams,
					value: response,
				});
			});
			if (this.awaitEmit) await Promise.all(promises);
		}

		return response;
	}

	private validate(params: Partial<ParamsSchema>): ParamsSchema {
		const result = this.paramsSchema.validate(params);
		if (result.error) throw new Error(result.error.message);
		return result.value;
	}
}

export { UseCase };
