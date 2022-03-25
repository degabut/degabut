import Joi from "joi";
import { container } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { EventHandler } from "./EventHandler";

abstract class UseCase<ParamsSchema = unknown, Response = unknown> {
	protected abstract paramsSchema: Joi.ObjectSchema<ParamsSchema>;
	protected abstract run(params: ParamsSchema): Promise<Response>;
	protected emits?: constructor<EventHandler>[];
	protected awaitEmit?: boolean;

	public async execute(params: Partial<ParamsSchema>): Promise<Response> {
		const validatedParams = this.validate(params);
		const response = await this.run(validatedParams);

		if (this.emits) {
			const promises = this.emits.map((handler) => {
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

	protected async emit<T extends EventHandler>(
		event: constructor<T>,
		data: Parameters<T["run"]>[0]
	): Promise<void> {
		const eventHandler = container.resolve(event); // TODO better resolve
		await eventHandler.run(data);
	}

	private validate(params: Partial<ParamsSchema>): ParamsSchema {
		const result = this.paramsSchema.validate(params);
		if (result.error) throw new Error(result.error.message);
		return result.value;
	}
}

export { UseCase };
