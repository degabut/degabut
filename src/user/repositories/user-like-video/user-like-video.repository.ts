import { IPaginationParameter } from "@common/interfaces";
import { Inject, Injectable } from "@nestjs/common";

import { UserLikeVideo } from "../../entities";
import { UserLikeVideoModel } from "./user-like-video.model";
import { UserLikeVideoRepositoryMapper } from "./user-like-video.repository-mapper";

export type IGetByUserIdPagination = { videoId: string; likedAt: string };

@Injectable()
export class UserLikeVideoRepository {
  constructor(
    @Inject(UserLikeVideoModel)
    private readonly userLikeVideoModel: typeof UserLikeVideoModel,
  ) {}

  public async insert(userLikeVideo: UserLikeVideo): Promise<void> {
    const model = UserLikeVideoRepositoryMapper.toRepository(userLikeVideo);
    await this.userLikeVideoModel
      .query()
      .insert(model)
      .returning("*")
      .onConflict(["video_id", "user_id"])
      .ignore();
  }

  public async delete(userId: string, videoId: string): Promise<void> {
    await this.userLikeVideoModel.query().delete().where({ user_id: userId, video_id: videoId });
  }

  public async getCountByUserId(userId: string): Promise<number> {
    const result = this.userLikeVideoModel.query().where("user_id", userId);
    return await result.resultSize();
  }

  public async getByUserId(
    userId: string,
    pagination: IPaginationParameter<IGetByUserIdPagination>,
    keyword?: string,
  ): Promise<UserLikeVideo[]> {
    const result = this.userLikeVideoModel
      .query()
      .where("user_id", userId)
      .orderBy("liked_at", "desc")
      .withGraphJoined("video")
      .withGraphJoined("video.channel")
      .limit(pagination.limit)
      .modify((qb) => {
        if (keyword) {
          const keywords = keyword.split(" ");
          const tsQuery = keywords.map((k) => `${k}:*`).join("&");
          qb.andWhereRaw(
            '(to_tsvector(video.title) @@ to_tsquery(?) or to_tsvector("video:channel".name) @@ to_tsquery(?))',
            [tsQuery, tsQuery],
          );
        }

        if (pagination.next) {
          const { likedAt, videoId } = pagination.next;
          qb.andWhereRaw("(liked_at, video_id) < (?, ?)", [likedAt, videoId]);
        }
      });

    return (await result).map((r) => UserLikeVideoRepositoryMapper.toDomainEntity(r));
  }

  public async isVideosLiked(userId: string, videoIds: string[]): Promise<boolean[]> {
    const result = await this.userLikeVideoModel
      .query()
      .select("video_id")
      .where("user_id", userId)
      .whereIn("video_id", videoIds);

    return videoIds.map((videoId) => result.some((r) => r.videoId === videoId));
  }
}
