import { DatabaseModule } from "@database/database.module";
import { Module } from "@nestjs/common";

import { Listeners } from "./listeners";
import { UserPlayHistoryRepository } from "./repositories";

@Module({
  imports: [DatabaseModule],
  providers: [UserPlayHistoryRepository, ...Listeners],
  exports: [UserPlayHistoryRepository],
})
export class HistoryModule {}
