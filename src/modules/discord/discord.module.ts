import { Module } from "@nestjs/common";

import { DiscordService } from "./services";

@Module({
  providers: [DiscordService],
  exports: [DiscordService],
})
export class DiscordModule {}
