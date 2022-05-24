import { FastifyInstance, FastifyPluginCallback } from "fastify";
import { asHandler } from "../api";
import { AddQueueTrackController } from "../controllers/me/AddQueueTrackController";
import { ChangeTrackOrderController } from "../controllers/me/ChangeTrackOrderController";
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
		"/queue/tracks",
		{ preHandler: [asHandler(VerifyTokenMiddleware)] },
		asHandler(AddQueueTrackController)
	);

	app.post(
		"/queue/tracks/order",
		{ preHandler: [asHandler(VerifyTokenMiddleware)] },
		asHandler(ChangeTrackOrderController)
	);

	done();
};

export const registerMeRoutes = (app: FastifyInstance): void => {
	app.register(registerRoutes, { prefix: "/me" });
};
