import { UserLikeVideo } from "@user/entities";
import { VideoRepositoryMapper } from "@youtube/repositories";

import { UserLikeVideoModel, UserLikeVideoModelProps } from "./user-like-video.model";

export class UserLikeVideoRepositoryMapper {
  public static toRepository(entity: UserLikeVideo): UserLikeVideoModelProps {
    return entity;
  }

  public static toDomainEntity(model: UserLikeVideoModel): UserLikeVideo {
    const entity = new UserLikeVideo({
      userId: model.userId,
      videoId: model.videoId,
      likedAt: new Date(model.likedAt),
      video: model.video ? VideoRepositoryMapper.toDomainEntity(model.video) : undefined,
    });

    return entity;
  }
}
