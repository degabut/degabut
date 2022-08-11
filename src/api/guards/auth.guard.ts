import { JwtAuthProvider } from "@auth/providers";
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ObservableBus } from "@nestjs/cqrs";
import { FastifyRequest } from "fastify";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtAuthProvider: JwtAuthProvider) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | ObservableBus<boolean> {
    const req = context.switchToHttp().getRequest<FastifyRequest>();

    req.headers.authorization = req.headers.authorization || "";
    const token = req.headers.authorization.split(" ")[1];

    if (!token) throw new UnauthorizedException();

    try {
      const userId = this.jwtAuthProvider.verify(token);
      req.userId = userId;
      return true;
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}
