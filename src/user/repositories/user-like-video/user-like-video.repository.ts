import { IPaginationParameter } from "@common/interfaces";
import { Inject, Injectable } from "@nestjs/common";

import { UserLikeVideo } from "../../entities";
import { UserLikeVideoModel } from "./user-like-video.model";
import { UserLikeVideoRepositoryMapper } from "./user-like-video.repository-mapper";

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

  public async isVideosLiked(userId: string, videoIds: string[]): Promise<boolean[]> {
    const result = await this.userLikeVideoModel
      .query()
      .select("video_id")
      .where("user_id", userId)
      .whereIn("video_id", videoIds);

    return videoIds.map((videoId) => result.some((r) => r.videoId === videoId));
  }
}
