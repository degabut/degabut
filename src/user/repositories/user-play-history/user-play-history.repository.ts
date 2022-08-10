import { Inject, Injectable } from "@nestjs/common";

import { UserPlayHistory } from "../../entities";
import { UserPlayHistoryModel } from "./user-play-history.model";
import { UserPlayHistoryRepositoryMapper } from "./user-play-history.repository-mapper";

@Injectable()
export class UserPlayHistoryRepository {
  constructor(
    @Inject(UserPlayHistoryModel)
    private readonly userPlayHistoryModel: typeof UserPlayHistoryModel,
  ) {}

  public async insert(userPlayHistory: UserPlayHistory): Promise<void> {
    const props = UserPlayHistoryRepositoryMapper.toRepository(userPlayHistory);
    await this.userPlayHistoryModel.query().insert(props).returning("*");
  }

  public async getLastPlayed(userId: string, count: number): Promise<UserPlayHistory[]> {
    const results = await this.userPlayHistoryModel
      .query()
      .from((builder) => {
        builder
          .from(UserPlayHistoryModel.tableName)
          .distinctOn("video_id")
          .orderBy("video_id", "asc")
          .orderBy("played_at", "desc")
          .where({ user_id: userId })
          .as("user_play_history");
      })
      .orderBy("played_at", "desc")
      .limit(count);

    return results.map((r) => UserPlayHistoryRepositoryMapper.toDomainEntity(r));
  }

  public async getMostPlayed(
    userId: string,
    options: { from?: Date; to?: Date; count?: number } = {},
  ): Promise<UserPlayHistory[]> {
    const results = await this.userPlayHistoryModel
      .query()
      .select("video_id")
      .count("video_id as count")
      .where({ user_id: userId })
      .groupBy("user_play_history.video_id")
      .orderBy("count", "desc")
      .modify((builder) => {
        const { from, to, count } = options;
        if (from) builder.where("played_at", ">=", from);
        if (to) builder.where("played_at", "<=", to);
        if (count) builder.limit(count);
      });

    return results.map((r) => UserPlayHistoryRepositoryMapper.toDomainEntity(r));
  }
}
