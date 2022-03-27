import Joi from "joi";
import { container } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { EventHandler } from "./EventHandler";

export type IUseCaseContext = {
	userId: string;
};

const contextSchema = Joi.object({
	userId: Joi.string().required(),
});

abstract class UseCase<ParamsSchema = unknown, Response = unknown> {
	protected abstract paramsSchema: Joi.ObjectSchema<ParamsSchema>;
	protected abstract run(params: ParamsSchema, context?: IUseCaseContext): Promise<Response>;
	protected emits?: constructor<EventHandler>[];
	protected awaitEmit?: boolean;

	public async execute(
		params: Partial<ParamsSchema>,
		context?: IUseCaseContext
	): Promise<Response> {
		const validatedParams = await this.validate(params, context);
		const response = await this.run(validatedParams, context);

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

	private async validate(
		params: Partial<ParamsSchema>,
		context?: IUseCaseContext
	): Promise<ParamsSchema> {
		if (context) await contextSchema.validateAsync(context);
		const result = await this.paramsSchema.validateAsync(params);
		return result;
	}
}

export { UseCase };
