import { AuthModule } from "@auth/auth.module";
import { HealthModule } from "@health/health.module";
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

import {
  AuthController,
  PlayersController,
  PlaylistsController,
  QueuesController,
  UsersController,
} from "./controllers";

@Module({
  imports: [CqrsModule, AuthModule, HealthModule],
  controllers: [
    AuthController,
    PlaylistsController,
    UsersController,
    PlayersController,
    QueuesController,
  ],
})
export class ApiModule {}
