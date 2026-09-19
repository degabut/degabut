import { AuthModule } from "@auth/auth.module";
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

import { EventsGateway } from "./events.gateway";
import { Listeners } from "./listeners";

@Module({
  imports: [AuthModule, CqrsModule],
  providers: [EventsGateway, ...Listeners],
})
export class EventsModule {}
