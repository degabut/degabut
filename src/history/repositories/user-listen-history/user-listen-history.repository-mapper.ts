import { MediaSourceRepositoryMapper } from "@media-source/repositories";

import { UserListenHistory } from "../../entities";
import { UserListenHistoryModel, UserListenHistoryModelProps } from "./user-listen-history.model";

export class UserListenHistoryRepositoryMapper {
  public static toRepository(entity: UserListenHistory): UserListenHistoryModelProps {
    return entity;
  }

  public static toDomainEntity(props: UserListenHistoryModel): UserListenHistory {
    const entity = new UserListenHistory({
      ...props,
      mediaSourceId: props.mediaSourceId,
      listenedAt: new Date(props.listenedAt),
      mediaSource: props.mediaSource
        ? MediaSourceRepositoryMapper.toDomainEntity(props.mediaSource)
        : undefined,
    });

    return entity;
  }
}
