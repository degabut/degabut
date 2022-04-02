import { FastifyInstance, FastifyPluginCallback } from "fastify";
import { asHandler } from "../api";
import { AddQueueTrackController } from "../controllers/me/AddQueueTrackController";
import { GetQueueController } from "../controllers/me/GetQueueController";
import { VerifyTokenMiddleware } from "../middlewares/VerifyTokenMiddleware";

const registerRoutes: FastifyPluginCallback = (app, _, done) => {
	app.get(
		"/queue",
		{ preHandler: [asHandler(VerifyTokenMiddleware)] },
		asHandler(GetQueueController)
	);

	app.post(
		"/queue/track",
		{ preHandler: [asHandler(VerifyTokenMiddleware)] },
		asHandler(AddQueueTrackController)
	);

	done();
};

export const registerMeRoutes = (app: FastifyInstance): void => {
	app.register(registerRoutes, { prefix: "/me" });
};
