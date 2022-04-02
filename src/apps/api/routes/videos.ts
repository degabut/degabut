import { FastifyInstance, FastifyPluginCallback } from "fastify";
import { asHandler } from "../api";
import { SearchVideoController } from "../controllers/videos/SearchVideoController";
import { VerifyTokenMiddleware } from "../middlewares/VerifyTokenMiddleware";

const registerRoutes: FastifyPluginCallback = (app, _, done) => {
	app.get(
		"/",
		{ preHandler: [asHandler(VerifyTokenMiddleware)] },
		asHandler(SearchVideoController)
	);

	done();
};

export const registerVideosRoutes = (app: FastifyInstance): void => {
	app.register(registerRoutes, { prefix: "/videos" });
};
