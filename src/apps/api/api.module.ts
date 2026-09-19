import { AuthModule } from "@auth/auth.module";
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

import {
  AuthController,
  HealthController,
  MeController,
  PlayersController,
  PlaylistsController,
  QueuesController,
  UsersController,
} from "./controllers";

@Module({
  imports: [CqrsModule, AuthModule],
  controllers: [
    AuthController,
    PlaylistsController,
    MeController,
    UsersController,
    PlayersController,
    QueuesController,
    HealthController,
  ],
})
export class ApiModule {}
