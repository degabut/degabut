import { Logger } from "@logger/logger.service";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

import { UserPlayHistoryRepository } from "../repositories";
import {
  UserMonthlyPlayActivityRepository,
  UserMonthlyPlayActivityRepositoryMapper,
} from "../repositories/user-monthly-play-activity";

@Injectable()
export class UserMonthlyPlayActivityService implements OnModuleInit {
  constructor(
    private readonly logger: Logger,
    private readonly userPlayHistoryRepository: UserPlayHistoryRepository,
    private readonly userMonthlyPlayActivityRepository: UserMonthlyPlayActivityRepository,
  ) {
    this.logger.setContext(UserMonthlyPlayActivityService.name);
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async calculateMonthlyPlayActivity() {
    const lastProcessedMonth = await this.userMonthlyPlayActivityRepository.getLatestMonth();
    const from = lastProcessedMonth;
    const now = new Date();
    const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // if same year and month, skip processing
    if (
      lastProcessedMonth &&
      lastProcessedMonth.getFullYear() === now.getFullYear() &&
      lastProcessedMonth.getMonth() === now.getMonth()
    ) {
      return;
    }

    const aggregatedData = await this.userPlayHistoryRepository.getMonthlyAggregation({ from, to });

    await this.userMonthlyPlayActivityRepository.upsert(
      aggregatedData.map((d) => UserMonthlyPlayActivityRepositoryMapper.toDomainEntity(d)),
    );
  }

  async onModuleInit() {
    await this.calculateMonthlyPlayActivity();
  }
}
