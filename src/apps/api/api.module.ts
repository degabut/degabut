import { AuthModule } from "@auth/auth.module";
import { IGlobalConfig } from "@common/config";
import { DynamicModule, Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

import {
  AuthController,
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
  ],
})
export class ApiModule {
  static forRoot(config: IGlobalConfig): DynamicModule {
    if (!config.auth?.jwt) throw new Error("JWT auth is required API");

    return {
      module: ApiModule,
      imports: [AuthModule.forRoot({ jwt: config.auth?.jwt })],
    };
  }
}
