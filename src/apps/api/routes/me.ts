import { FastifyInstance, FastifyPluginCallback } from "fastify";
import { asHandler, GetSelfQueueController } from "../";
import { VerifyTokenMiddleware } from "../middlewares/VerifiyTokenMiddleware";

const registerRoutes: FastifyPluginCallback = (app, _, done) => {
	app.get(
		"/queue",
		{ preHandler: [asHandler(VerifyTokenMiddleware)] },
		asHandler(GetSelfQueueController)
	);

	done();
};

export const registerMeRoutes = (app: FastifyInstance): void => {
	app.register(registerRoutes, { prefix: "/me" });
};
