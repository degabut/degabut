import { AuthModule } from "@auth/auth.module";
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

import { AuthController, HealthController, UsersController, VideosController } from "./controllers";
import { AuthMiddleware } from "./middlewares";

@Module({
  imports: [CqrsModule, AuthModule],
  controllers: [AuthController, HealthController, UsersController, VideosController],
})
export class ApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude({ path: "/auth", method: RequestMethod.POST })
      .forRoutes({ path: "/*", method: RequestMethod.ALL });
  }
}
