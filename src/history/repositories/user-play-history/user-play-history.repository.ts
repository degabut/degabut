import { Inject, Injectable } from "@nestjs/common";

import { UserPlayHistory } from "../../entities";
import { UserPlayHistoryModel } from "./user-play-history.model";
import { UserPlayHistoryRepositoryMapper } from "./user-play-history.repository-mapper";

type GetSelections = { userId: string } | { guildId: string } | { voiceChannelId: string };

type CommonOptions = {
  count?: number;
  excludeUserIds?: string[];
  includeVideo?: boolean;
};

type GetLastPlayedOptions = CommonOptions;

type GetMostPlayedOptions = CommonOptions & {
  from?: Date;
  to?: Date;
};

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

  public async removeUserVideoHistory(userId: string, videoId: string): Promise<void> {
    await this.userPlayHistoryModel.query().delete().where({ user_id: userId, video_id: videoId });
  }

  public async getLastPlayedByUserId(
    userId: string,
    options: GetLastPlayedOptions,
  ): Promise<UserPlayHistory[]> {
    return this.getLastPlayed({ userId }, options);
  }

  public async getLastPlayedByVoiceChannelId(
    voiceChannelId: string,
    options: GetLastPlayedOptions,
  ): Promise<UserPlayHistory[]> {
    return this.getLastPlayed({ voiceChannelId }, options);
  }

  public async getLastPlayedByGuildId(
    guildId: string,
    options: GetLastPlayedOptions,
  ): Promise<UserPlayHistory[]> {
    return this.getLastPlayed({ guildId }, options);
  }

  private async getLastPlayed(
    selection: GetSelections,
    options: GetLastPlayedOptions,
  ): Promise<UserPlayHistory[]> {
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

            if (options.excludeUserIds) qb.whereNotIn("user_id", options.excludeUserIds);
          })
          .as("user_play_history");
      })
      .orderBy("played_at", "desc")
      .modify((builder) => {
        const { count, includeVideo } = options;
        if (count) builder.limit(count);
        if (includeVideo) builder.withGraphFetched("video").withGraphFetched("video.channel");
      });

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

        if (options.excludeUserIds) qb.whereNotIn("user_id", options.excludeUserIds);
      })
      .groupBy("user_play_history.video_id")
      .orderBy("count", "desc")
      .modify((builder) => {
        const { from, to, count, includeVideo } = options;
        if (from) builder.where("played_at", ">=", from);
        if (to) builder.where("played_at", "<=", to);
        if (count) builder.limit(count);
        if (includeVideo) builder.withGraphFetched("video").withGraphFetched("video.channel");
      });

    return results.map((r) => UserPlayHistoryRepositoryMapper.toDomainEntity(r));
  }
}
