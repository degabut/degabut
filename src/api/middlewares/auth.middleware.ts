import { JwtAuthProvider } from "@auth/providers";
import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { IncomingMessage, ServerResponse } from "http";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtAuthProvider: JwtAuthProvider) {}

  use(req: IncomingMessage, res: ServerResponse, next: () => unknown) {
    req.headers.authorization = req.headers.authorization || "";
    const token = req.headers.authorization.split(" ")[1];

    if (!token) throw new UnauthorizedException();

    try {
      const userId = this.jwtAuthProvider.verify(token);
      req.userId = userId;
      next();
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}
