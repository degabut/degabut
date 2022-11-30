import { AuthModule } from "@auth/auth.module";
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

import {
  AuthController,
  HealthController,
  PlayersController,
  PlaylistsController,
  QueuesController,
  UsersController,
} from "./controllers";

@Module({
  imports: [CqrsModule, AuthModule],
  controllers: [
    AuthController,
    HealthController,
    PlaylistsController,
    UsersController,
    PlayersController,
    QueuesController,
  ],
})
export class ApiModule {}
