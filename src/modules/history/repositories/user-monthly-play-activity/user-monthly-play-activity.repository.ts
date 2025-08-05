import { UserMonthlyPlayActivity } from "@history/entities";
import { Inject, Injectable } from "@nestjs/common";

import { UserMonthlyPlayActivityModel } from "./user-monthly-play-activity.model";
import { UserMonthlyPlayActivityRepositoryMapper } from "./user-monthly-play-activity.repository-mapper";

@Injectable()
export class UserMonthlyPlayActivityRepository {
  constructor(
    @Inject(UserMonthlyPlayActivityModel)
    private readonly userMonthlyPlayActivityModel: typeof UserMonthlyPlayActivityModel,
  ) {}

  public async getActivity(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<UserMonthlyPlayActivity[]> {
    const results = await this.userMonthlyPlayActivityModel
      .query()
      .where("user_id", userId)
      .andWhere("date", ">=", from)
      .andWhere("date", "<=", to);

    return results.map((r) => UserMonthlyPlayActivityRepositoryMapper.toDomainEntity(r));
  }

  public async upsert(data: UserMonthlyPlayActivity[]): Promise<void> {
    if (!data.length) return;

    await this.userMonthlyPlayActivityModel
      .query()
      .insert(data.map((d) => UserMonthlyPlayActivityRepositoryMapper.toRepository(d)))
      .onConflict(["user_id", "date"])
      .merge(["play_count", "unique_play_count"])
      .returning("*");
  }

  async getLatestMonth(): Promise<Date | null> {
    const results = await this.userMonthlyPlayActivityModel
      .query()
      .orderBy("date", "desc")
      .limit(1);

    return results.at(0)?.date || null;
  }
}
