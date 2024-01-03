import { DatabaseModule } from "@database/database.module";
import { HistoryModule } from "@history/history.module";
import { MediaSourceModule } from "@media-source/media-source.module";
import { Module } from "@nestjs/common";
import { QueueModule } from "@queue/queue.module";

import { Commands } from "./commands";
import { Queries } from "./queries";
import { UserLikeMediaSourceRepository } from "./repositories";

@Module({
  imports: [DatabaseModule, QueueModule, MediaSourceModule, HistoryModule],
  providers: [UserLikeMediaSourceRepository, ...Queries, ...Commands],
  exports: [UserLikeMediaSourceRepository],
})
export class UserModule {}
