import { DatabaseModule } from "@database/database.module";
import { HistoryModule } from "@history/history.module";
import { MediaSourceModule } from "@media-source/media-source.module";
import { Module, forwardRef } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { QueueModule } from "@queue/queue.module";

import { Commands } from "./commands";
import { Queries } from "./queries";
import { UserLikeMediaSourceRepository } from "./repositories";

@Module({
  imports: [
    CqrsModule,
    DatabaseModule,
    forwardRef(() => QueueModule), // TODO remove dependency
    MediaSourceModule,
    HistoryModule,
  ],
  providers: [UserLikeMediaSourceRepository, ...Queries, ...Commands],
  exports: [UserLikeMediaSourceRepository],
})
export class UserModule {}
