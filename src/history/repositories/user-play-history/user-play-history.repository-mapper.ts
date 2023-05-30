import { UserPlayHistory } from "../../entities";
import { UserPlayHistoryModel, UserPlayHistoryModelProps } from "./user-play-history.model";

export class UserPlayHistoryRepositoryMapper {
  public static toRepository(entity: UserPlayHistory): UserPlayHistoryModelProps {
    return entity;
  }

  public static toDomainEntity(props: UserPlayHistoryModel): UserPlayHistory {
    const entity = new UserPlayHistory({
      ...props,
      playedAt: new Date(props.playedAt),
    });

    return entity;
  }
}
