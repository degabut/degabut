import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

import { HealthController, UsersController, VideosController } from "./controllers";

@Module({
  imports: [CqrsModule],
  controllers: [HealthController, UsersController, VideosController],
})
export class ApiModule {}
