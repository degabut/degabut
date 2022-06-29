import { FastifyInstance, FastifyPluginCallback } from "fastify";
import { asHandler } from "../api";
import { GetVideoHistoryController } from "../controllers/users/GetVideoHistoryController";
import { VerifyTokenMiddleware } from "../middlewares/VerifyTokenMiddleware";

const registerRoutes: FastifyPluginCallback = (app, _, done) => {
	app.get(
		"/:id/videos",
		{ preHandler: [asHandler(VerifyTokenMiddleware)] },
		asHandler(GetVideoHistoryController)
	);

	done();
};

export const registerUsersRoutes = (app: FastifyInstance): void => {
	app.register(registerRoutes, { prefix: "/users" });
};
