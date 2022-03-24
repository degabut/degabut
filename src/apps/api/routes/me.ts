import { FastifyInstance, FastifyPluginCallback } from "fastify";
import { asHandler, GetSelfQueueController } from "../";

const registerRoutes: FastifyPluginCallback = (app, _, done) => {
	app.get("/queue", asHandler(GetSelfQueueController));

	done();
};

export const registerMeRoutes = (app: FastifyInstance): void => {
	app.register(registerRoutes, { prefix: "/me" });
};
