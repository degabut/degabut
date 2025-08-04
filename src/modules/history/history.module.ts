import { DatabaseModule } from "@database/database.module";
import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";

import { Listeners } from "./listeners";
import {
  UserListenHistoryRepository,
  UserMonthlyPlayActivityRepository,
  UserPlayHistoryRepository,
} from "./repositories";
import { UserMonthlyPlayActivityService } from "./services";

@Module({
  imports: [DatabaseModule, ScheduleModule.forRoot()],
  providers: [
    UserPlayHistoryRepository,
    UserListenHistoryRepository,
    UserMonthlyPlayActivityRepository,
    UserMonthlyPlayActivityService,
    ...Listeners,
  ],
  exports: [
    UserPlayHistoryRepository,
    UserListenHistoryRepository,
    UserMonthlyPlayActivityRepository,
  ],
})
export class HistoryModule {}
