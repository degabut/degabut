import { DatabaseModule } from "@database/database.module";
import { Module } from "@nestjs/common";

import { Listeners } from "./listeners";
import { UserListenHistoryRepository, UserPlayHistoryRepository } from "./repositories";

@Module({
  imports: [DatabaseModule],
  providers: [UserPlayHistoryRepository, UserListenHistoryRepository, ...Listeners],
  exports: [UserPlayHistoryRepository, UserListenHistoryRepository],
})
export class HistoryModule {}
