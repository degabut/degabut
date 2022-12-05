import { DatabaseModule } from "@database/database.module";
import { HistoryModule } from "@history/history.module";
import { Module } from "@nestjs/common";
import { QueueModule } from "@queue/queue.module";
import { YoutubeModule } from "@youtube/youtube.module";

import { Queries } from "./queries";

@Module({
  imports: [DatabaseModule, QueueModule, YoutubeModule, HistoryModule],
  providers: [...Queries],
})
export class UserModule {}
