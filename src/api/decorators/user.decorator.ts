import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { FastifyRequest } from "fastify";

export const User = createParamDecorator((_, context: ExecutionContext): AuthUser => {
  const request = context.getArgByIndex<FastifyRequest>(0);
  if (!request.userId) throw new UnauthorizedException("User not found");
  return { id: request.userId };
});

export interface AuthUser {
  id: string;
}
