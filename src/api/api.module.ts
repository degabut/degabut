import { AuthModule } from "@auth/auth.module";
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

import {
  AuthController,
  HealthController,
  QueuesController,
  UsersController,
  VideosController,
} from "./controllers";

@Module({
  imports: [CqrsModule, AuthModule],
  controllers: [
    AuthController,
    HealthController,
    UsersController,
    VideosController,
    QueuesController,
  ],
})
export class ApiModule {}
