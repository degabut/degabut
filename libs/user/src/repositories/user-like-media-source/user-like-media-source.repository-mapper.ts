import { MediaSourceRepositoryMapper } from "@media-source/repositories";
import { UserLikeMediaSource } from "@user/entities";

import { UserLikeMediaSourceModel, UserLikeMediaSourceProps } from "./user-like-media-source.model";

export class UserLikeMediaSourceRepositoryMapper {
  public static toRepository(entity: UserLikeMediaSource): UserLikeMediaSourceProps {
    return entity;
  }

  public static toDomainEntity(model: UserLikeMediaSourceModel): UserLikeMediaSource {
    const entity = new UserLikeMediaSource({
      userId: model.userId,
      mediaSourceId: model.mediaSourceId,
      likedAt: new Date(model.likedAt),
      mediaSource: model.mediaSource
        ? MediaSourceRepositoryMapper.toDomainEntity(model.mediaSource)
        : undefined,
    });

    return entity;
  }
}
