import { IPaginationParameter } from "@common/interfaces";
import { Inject, Injectable } from "@nestjs/common";

import { UserLikeMediaSource } from "../../entities";
import { UserLikeMediaSourceModel } from "./user-like-media-source.model";
import { UserLikeMediaSourceRepositoryMapper } from "./user-like-media-source.repository-mapper";

export type IGetByUserIdPagination = { mediaSourceId: string; likedAt: string };

@Injectable()
export class UserLikeMediaSourceRepository {
  constructor(
    @Inject(UserLikeMediaSourceModel)
    private readonly userLikeModel: typeof UserLikeMediaSourceModel,
  ) {}

  public async insert(entity: UserLikeMediaSource): Promise<void> {
    const model = UserLikeMediaSourceRepositoryMapper.toRepository(entity);
    await this.userLikeModel
      .query()
      .insert(model)
      .returning("*")
      .onConflict(["media_source_id", "user_id"])
      .ignore();
  }

  public async delete(userId: string, mediaSourceId: string): Promise<void> {
    await this.userLikeModel
      .query()
      .delete()
      .where({ user_id: userId, media_source_id: mediaSourceId });
  }

  public async getCountByUserId(userId: string): Promise<number> {
    const result = this.userLikeModel.query().where("user_id", userId);
    return await result.resultSize();
  }

  public async getByUserId(
    userId: string,
    options: IPaginationParameter & { keyword?: string },
  ): Promise<UserLikeMediaSource[]> {
    const result = this.userLikeModel
      .query()
      .select()
      .where("user_id", userId)
      .orderBy("liked_at", "desc")
      .withGraphJoined("mediaSource")
      .withGraphJoined("mediaSource.youtubeVideo")
      .withGraphJoined("mediaSource.youtubeVideo.channel")
      .withGraphJoined("mediaSource.spotifyTrack")
      .withGraphJoined("mediaSource.spotifyTrack.album")
      .withGraphJoined("mediaSource.spotifyTrack.artists")
      .modify((qb) => {
        const { keyword, limit, page } = options;

        if (keyword) {
          const keywords = keyword.split(" ");
          const tsQuery = keywords.map((k) => `${k}:*`).join("&");
          qb.andWhereRaw(
            '(to_tsvector(coalesce("mediaSource:youtubeVideo".title, "mediaSource:spotifyTrack".name)) @@ to_tsquery(?) or to_tsvector("mediaSource:youtubeVideo:channel".name) @@ to_tsquery(?))',
            [tsQuery, tsQuery],
          );
        }

        if (limit) {
          qb.limit(limit);
          if (page) qb.offset(limit * (page - 1));
        }
      });

    return (await result).map((r) => UserLikeMediaSourceRepositoryMapper.toDomainEntity(r));
  }

  public async isLiked(userId: string, sourceIds: string[]): Promise<boolean[]> {
    const result = await this.userLikeModel
      .query()
      .select("media_source_id")
      .where("user_id", userId)
      .whereIn("media_source_id", sourceIds);

    return sourceIds.map((id) => result.some((r) => r.mediaSourceId === id));
  }
}
