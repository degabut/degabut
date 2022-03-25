import fastify, { FastifyInstance, FastifyReply, FastifyRequest, RouteHandler } from "fastify";
import { container } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { Controller } from "./core";
import { registerMeRoutes } from "./routes";
import { registerAuthRoutes } from "./routes/auth";

export const asHandler = (Controller: constructor<Controller>): RouteHandler => {
	return async (request: FastifyRequest, reply: FastifyReply) => {
		const controller = container.resolve(Controller);

		if (request.user) controller.user = request.user;
		const response = await controller.execute({
			body: request.body || {},
			params: request.params || {},
			headers: request.headers || {},
		});
		if (controller.user) request.user = controller.user;

		if (controller.done) return reply.status(response.status).send(response.body);
	};
};

export const createApi = (): FastifyInstance => {
	const app = fastify();

	registerMeRoutes(app);
	registerAuthRoutes(app);

	return app;
};
