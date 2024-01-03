import { MediaSourceRepositoryMapper } from "@media-source/repositories";

import { UserPlayHistory } from "../../entities";
import { UserPlayHistoryModel, UserPlayHistoryModelProps } from "./user-play-history.model";

export class UserPlayHistoryRepositoryMapper {
  public static toRepository(entity: UserPlayHistory): UserPlayHistoryModelProps {
    return entity;
  }

  public static toDomainEntity(props: UserPlayHistoryModel): UserPlayHistory {
    const entity = new UserPlayHistory({
      ...props,
      mediaSourceId: props.mediaSourceId,
      mediaSource: props.mediaSource
        ? MediaSourceRepositoryMapper.toDomainEntity(props.mediaSource)
        : undefined,
      playedAt: new Date(props.playedAt),
    });

    return entity;
  }
}
