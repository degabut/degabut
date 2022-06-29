import fastify, { FastifyInstance, FastifyReply, FastifyRequest, RouteHandler } from "fastify";
import { container } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { Controller } from "./core/Controller";
import { registerAuthRoutes } from "./routes/auth";
import { registerMeRoutes } from "./routes/me";
import { registerUsersRoutes } from "./routes/users";
import { registerVideosRoutes } from "./routes/videos";

export const asHandler = (Controller: constructor<Controller>): RouteHandler => {
	return async (request: FastifyRequest, reply: FastifyReply) => {
		const controller = container.resolve(Controller);

		if (request.user) controller.user = request.user;
		const response = await controller.execute({
			body: request.body || {},
			params: request.params || {},
			headers: request.headers || {},
			query: request.query || {},
		});
		if (controller.user) request.user = controller.user;

		if (response.status) return reply.status(response.status).send(response.body);
	};
};

export const createApi = (): FastifyInstance => {
	const app = fastify();

	registerMeRoutes(app);
	registerAuthRoutes(app);
	registerVideosRoutes(app);
	registerUsersRoutes(app);

	return app;
};
