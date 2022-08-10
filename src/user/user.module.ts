import { DatabaseModule } from "@database/database.module";
import { Module } from "@nestjs/common";
import { QueueModule } from "@queue/queue.module";
import { YoutubeModule } from "@youtube/youtube.module";

import { Listeners } from "./listeners";
import { Queries } from "./queries";
import { UserPlayHistoryRepository } from "./repositories";

@Module({
  imports: [DatabaseModule, QueueModule, YoutubeModule],
  providers: [UserPlayHistoryRepository, ...Queries, ...Listeners],
})
export class UserModule {}
