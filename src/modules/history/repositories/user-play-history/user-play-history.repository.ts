import { IPaginationParameter } from "@common/interfaces";
import { UserMostPlayedDto } from "@history/dtos";
import { MediaSourceRepositoryMapper } from "@media-source/repositories";
import { Inject, Injectable } from "@nestjs/common";

import { UserPlayHistory } from "../../entities";
import { UserPlayHistoryModel } from "./user-play-history.model";
import { UserPlayHistoryRepositoryMapper } from "./user-play-history.repository-mapper";

type GetSelections = { userId: string } | { guildId: string } | { voiceChannelId: string };

type CommonOptions = {
  limit?: number;
  excludeUserIds?: string[];
  includeContent?: boolean;
};

type GetLastPlayedOptions = CommonOptions & IPaginationParameter;

type GetMostPlayedOptions = CommonOptions & {
  from?: Date;
  to?: Date;
};

type GetCountOptions = {
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

  public async removeUserPlayHistory(userId: string, mediaSourceId: string): Promise<void> {
    await this.userPlayHistoryModel
      .query()
      .delete()
      .where({ user_id: userId, media_source_id: mediaSourceId });
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
          .distinctOn("media_source_id")
          .orderBy("media_source_id", "asc")
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
        const { limit, page, includeContent } = options;
        if (limit) {
          builder.limit(limit);
          if (page) builder.offset(limit * (page - 1));
        }
        if (includeContent) {
          builder
            .withGraphJoined("mediaSource")
            .withGraphJoined("mediaSource.youtubeVideo")
            .withGraphJoined("mediaSource.youtubeVideo.channel")
            .withGraphJoined("mediaSource.spotifyTrack")
            .withGraphJoined("mediaSource.spotifyTrack.album")
            .withGraphFetched("mediaSource.spotifyTrack.artists");
        }
      });

    return results.map((r) => UserPlayHistoryRepositoryMapper.toDomainEntity(r));
  }

  public async getMostPlayedByUserId(
    userId: string,
    options: GetMostPlayedOptions = {},
  ): Promise<UserMostPlayedDto[]> {
    return this.getMostPlayed({ userId }, options);
  }

  public async getMostPlayedByVoiceChannelId(
    voiceChannelId: string,
    options: GetMostPlayedOptions = {},
  ): Promise<UserMostPlayedDto[]> {
    return this.getMostPlayed({ voiceChannelId }, options);
  }

  public async getMostPlayedByGuildId(
    guildId: string,
    options: GetMostPlayedOptions = {},
  ): Promise<UserMostPlayedDto[]> {
    return this.getMostPlayed({ guildId }, options);
  }

  private async getMostPlayed(selection: GetSelections, options: GetMostPlayedOptions) {
    const query = this.userPlayHistoryModel
      .query()
      .select("media_source_id")
      .count("media_source_id as count")
      .where((qb) => {
        if ("userId" in selection) qb.where({ user_id: selection.userId });
        else if ("guildId" in selection) qb.where({ guild_id: selection.guildId });
        else qb.where({ voice_channel_id: selection.voiceChannelId });

        if (options.excludeUserIds) qb.whereNotIn("user_id", options.excludeUserIds);
      })
      .groupBy("user_play_history.media_source_id")
      .orderBy("count", "desc")
      .modify((qb) => {
        const { from, to, limit, includeContent } = options;
        if (from) qb.where("played_at", ">=", from);
        if (to) qb.where("played_at", "<=", to);
        if (limit) qb.limit(limit);
        if (includeContent) {
          qb.withGraphJoined("mediaSource")
            .withGraphJoined("mediaSource.youtubeVideo")
            .withGraphJoined("mediaSource.youtubeVideo.channel")
            .withGraphJoined("mediaSource.spotifyTrack")
            .withGraphJoined("mediaSource.spotifyTrack.album")
            .withGraphFetched("mediaSource.spotifyTrack.artists");
        }
      });

    const results = (await query) as unknown as (UserPlayHistoryModel & { count: number })[];

    return results.map((r) =>
      UserMostPlayedDto.create({
        count: +r.count as number,
        mediaSourceId: r.mediaSourceId,
        mediaSource: r.mediaSource
          ? MediaSourceRepositoryMapper.toDomainEntity(r.mediaSource)
          : undefined,
      }),
    );
  }

  public async getUniqueCount(userId: string, options: GetCountOptions = {}): Promise<number> {
    const result = await this.userPlayHistoryModel
      .knexQuery()
      .countDistinct("media_source_id as count")
      .where({ user_id: userId })
      .modify((builder) => {
        const { from, to } = options;
        if (from) builder.where("played_at", ">=", from);
        if (to) builder.where("played_at", "<=", to);
      })
      .first();

    return +result.count;
  }

  public async getDurationAndCount(userId: string, options: GetCountOptions = {}) {
    const result = await this.userPlayHistoryModel
      .knexQuery()
      .select(
        this.userPlayHistoryModel
          .knex()
          .raw(
            "sum(coalesce(youtube_video.duration, spotify_track.duration_ms / 1000)) as duration",
          ),
      )
      .count("media_source.id as count")
      .join("media_source", "media_source.id", "user_play_history.media_source_id")
      .leftJoin("youtube_video", "youtube_video.id", "media_source.youtube_video_id")
      .leftJoin("spotify_track", "spotify_track.id", "media_source.spotify_track_id")
      .where({ user_id: userId })
      .modify((builder) => {
        const { from, to } = options;
        if (from) builder.where("played_at", ">=", from);
        if (to) builder.where("played_at", "<=", to);
      })
      .first();

    return {
      duration: +result.duration,
      count: +result.count,
    };
  }
}
