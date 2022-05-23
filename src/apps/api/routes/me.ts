import { FastifyInstance, FastifyPluginCallback } from "fastify";
import { asHandler } from "../api";
import { AddQueueTrackController } from "../controllers/me/AddQueueTrackController";
import { GetQueueController } from "../controllers/me/GetQueueController";
import { GetRecommendationsController } from "../controllers/me/GetRecommendationsController";
import { VerifyTokenMiddleware } from "../middlewares/VerifyTokenMiddleware";

const registerRoutes: FastifyPluginCallback = (app, _, done) => {
	app.get(
		"/videos/recommendations",
		{ preHandler: [asHandler(VerifyTokenMiddleware)] },
		asHandler(GetRecommendationsController)
	);

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
