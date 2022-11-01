import { Inject, Injectable } from "@nestjs/common";

import { UserPlayHistory } from "../../entities";
import { UserPlayHistoryModel } from "./user-play-history.model";
import { UserPlayHistoryRepositoryMapper } from "./user-play-history.repository-mapper";

type GetSelections =
  | {
      userId: string;
    }
  | {
      guildId: string;
    }
  | {
      voiceChannelId: string;
    };

type GetMostPlayedOptions = { from?: Date; to?: Date; count?: number };

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

  public async getLastPlayedByUserId(userId: string, count: number): Promise<UserPlayHistory[]> {
    return this.getLastPlayed({ userId }, count);
  }

  public async getLastPlayedByVoiceChannelId(
    voiceChannelId: string,
    count: number,
  ): Promise<UserPlayHistory[]> {
    return this.getLastPlayed({ voiceChannelId }, count);
  }

  public async getLastPlayedByGuildId(guildId: string, count: number): Promise<UserPlayHistory[]> {
    return this.getLastPlayed({ guildId }, count);
  }

  private async getLastPlayed(selection: GetSelections, count: number): Promise<UserPlayHistory[]> {
    const results = await this.userPlayHistoryModel
      .query()
      .from((builder) => {
        builder
          .from(UserPlayHistoryModel.tableName)
          .distinctOn("video_id")
          .orderBy("video_id", "asc")
          .orderBy("played_at", "desc")
          .where((qb) => {
            if ("userId" in selection) qb.where({ user_id: selection.userId });
            else if ("guildId" in selection) qb.where({ guild_id: selection.guildId });
            else qb.where({ voice_channel_id: selection.voiceChannelId });
          })
          .as("user_play_history");
      })
      .orderBy("played_at", "desc")
      .limit(count);

    return results.map((r) => UserPlayHistoryRepositoryMapper.toDomainEntity(r));
  }

  public async getMostPlayedByUserId(
    userId: string,
    options: GetMostPlayedOptions = {},
  ): Promise<UserPlayHistory[]> {
    return this.getMostPlayed({ userId }, options);
  }

  public async getMostPlayedByVoiceChannelId(
    voiceChannelId: string,
    options: GetMostPlayedOptions = {},
  ): Promise<UserPlayHistory[]> {
    return this.getMostPlayed({ voiceChannelId }, options);
  }

  public async getMostPlayedByGuildId(
    guildId: string,
    options: GetMostPlayedOptions = {},
  ): Promise<UserPlayHistory[]> {
    return this.getMostPlayed({ guildId }, options);
  }

  private async getMostPlayed(selection: GetSelections, options: GetMostPlayedOptions) {
    const results = await this.userPlayHistoryModel
      .query()
      .select("video_id")
      .count("video_id as count")
      .where((qb) => {
        if ("userId" in selection) qb.where({ user_id: selection.userId });
        else if ("guildId" in selection) qb.where({ guild_id: selection.guildId });
        else qb.where({ voice_channel_id: selection.voiceChannelId });
      })
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
