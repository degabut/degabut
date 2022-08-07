import { AuthModule } from "@auth/auth.module";
import { Module } from "@nestjs/common";

import { EventsGateway } from "./events.gateway";
import { Listeners } from "./listeners";

@Module({
  imports: [AuthModule],
  providers: [EventsGateway, ...Listeners],
})
export class EventsModule {}
