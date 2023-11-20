import { DatabaseModule } from "@database/database.module";
import { HistoryModule } from "@history/history.module";
import { Module } from "@nestjs/common";
import { QueueModule } from "@queue/queue.module";
import { YoutubeModule } from "@youtube/youtube.module";

import { Commands } from "./commands";
import { Queries } from "./queries";
import { UserLikeVideoRepository } from "./repositories";

@Module({
  imports: [DatabaseModule, QueueModule, YoutubeModule, HistoryModule],
  providers: [UserLikeVideoRepository, ...Queries, ...Commands],
  exports: [UserLikeVideoRepository],
})
export class UserModule {}
