import { FastifyInstance, FastifyPluginCallback } from "fastify";
import { asHandler } from "../api";
import { AddQueueTrackController } from "../controllers/me/AddQueueTrackController";
import { ChangeLoopTypeController } from "../controllers/me/ChangeLoopTypeController";
import { ChangeTrackOrderController } from "../controllers/me/ChangeTrackOrderController";
import { GetQueueController } from "../controllers/me/GetQueueController";
import { GetRecommendationsController } from "../controllers/me/GetRecommendationsController";
import { PauseQueueController } from "../controllers/me/PauseQueueController";
import { PlayTrackController } from "../controllers/me/PlayTrackController";
import { RemoveQueueTracksController } from "../controllers/me/RemoveQueueTracksController";
import { RemoveTrackController } from "../controllers/me/RemoveTrackController";
import { SkipController } from "../controllers/me/SkipController";
import { ToggleAutoplayController } from "../controllers/me/ToggleAutoplayController";
import { ToggleShuffleController } from "../controllers/me/ToggleShuffleController";
import { UnpauseQueueController } from "../controllers/me/UnpauseQueueController";
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

	app.patch(
		"/queue/loop-type",
		{ preHandler: [asHandler(VerifyTokenMiddleware)] },
		asHandler(ChangeLoopTypeController)
	);

	app.patch(
		"/queue/autoplay",
		{ preHandler: [asHandler(VerifyTokenMiddleware)] },
		asHandler(ToggleAutoplayController)
	);

	app.patch(
		"/queue/shuffle",
		{ preHandler: [asHandler(VerifyTokenMiddleware)] },
		asHandler(ToggleShuffleController)
	);

	app.post(
		"/queue/pause",
		{ preHandler: [asHandler(VerifyTokenMiddleware)] },
		asHandler(PauseQueueController)
	);

	app.post(
		"/queue/unpause",
		{ preHandler: [asHandler(VerifyTokenMiddleware)] },
		asHandler(UnpauseQueueController)
	);

	app.post(
		"/queue/skip",
		{ preHandler: [asHandler(VerifyTokenMiddleware)] },
		asHandler(SkipController)
	);

	app.post(
		"/queue/tracks",
		{ preHandler: [asHandler(VerifyTokenMiddleware)] },
		asHandler(AddQueueTrackController)
	);

	app.delete(
		"/queue/tracks",
		{ preHandler: [asHandler(VerifyTokenMiddleware)] },
		asHandler(RemoveQueueTracksController)
	);

	app.delete(
		"/queue/tracks/:id",
		{ preHandler: [asHandler(VerifyTokenMiddleware)] },
		asHandler(RemoveTrackController)
	);

	app.post(
		"/queue/tracks/:id/play",
		{ preHandler: [asHandler(VerifyTokenMiddleware)] },
		asHandler(PlayTrackController)
	);

	app.patch(
		"/queue/tracks/:id/order",
		{ preHandler: [asHandler(VerifyTokenMiddleware)] },
		asHandler(ChangeTrackOrderController)
	);

	done();
};

export const registerMeRoutes = (app: FastifyInstance): void => {
	app.register(registerRoutes, { prefix: "/me" });
};
