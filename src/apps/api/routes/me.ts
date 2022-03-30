import { FastifyInstance, FastifyPluginCallback } from "fastify";
import { asHandler } from "../api";
import { GetSelfQueueController } from "../controllers/me/GetSelfQueueController";
import { VerifyTokenMiddleware } from "../middlewares/VerifyTokenMiddleware";

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
