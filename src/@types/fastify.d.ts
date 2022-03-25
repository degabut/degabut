import { APIUser } from "discord-api-types/v9";
import "fastify";

declare module "fastify" {
	interface FastifyRequest {
		user: APIUser;
	}
}
