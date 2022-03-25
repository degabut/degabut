import { FastifyInstance, FastifyPluginCallback } from "fastify";
import { asHandler, LoginController } from "../";

const registerRoutes: FastifyPluginCallback = (app, _, done) => {
	app.post("/", asHandler(LoginController));

	done();
};

export const registerAuthRoutes = (app: FastifyInstance): void => {
	app.register(registerRoutes, { prefix: "/auth" });
};
