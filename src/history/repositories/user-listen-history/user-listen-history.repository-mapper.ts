import { UserListenHistory } from "../../entities";
import { UserListenHistoryModel, UserListenHistoryModelProps } from "./user-listen-history.model";

export class UserListenHistoryRepositoryMapper {
  public static toRepository(entity: UserListenHistory): UserListenHistoryModelProps {
    return entity;
  }

  public static toDomainEntity(props: UserListenHistoryModel): UserListenHistory {
    const entity = new UserListenHistory({
      ...props,
      listenedAt: new Date(props.listenedAt),
    });

    return entity;
  }
}
