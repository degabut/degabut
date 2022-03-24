import fastify, { FastifyInstance, FastifyReply, FastifyRequest, RouteHandler } from "fastify";
import { container } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { Controller } from "./core";
import { registerMeRoutes } from "./routes";

export const asHandler = (Controller: constructor<Controller>): RouteHandler => {
	const controller = container.resolve(Controller); // TODO better resolve

	return async (request: FastifyRequest, reply: FastifyReply) => {
		const response = await controller.execute({
			body: request.body,
			params: request.params,
		});
		reply.status(response.status).send(response.body);
	};
};

export const createApi = (): FastifyInstance => {
	const app = fastify();

	registerMeRoutes(app);

	return app;
};
