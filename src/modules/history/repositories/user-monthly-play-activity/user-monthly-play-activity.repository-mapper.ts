import { UserMonthlyPlayActivity } from "../../entities";
import { UserMonthlyPlayActivityProps } from "./user-monthly-play-activity.model";

export class UserMonthlyPlayActivityRepositoryMapper {
  public static toRepository(entity: UserMonthlyPlayActivity): UserMonthlyPlayActivityProps {
    return entity;
  }

  public static toDomainEntity(props: UserMonthlyPlayActivityProps): UserMonthlyPlayActivity {
    const entity = new UserMonthlyPlayActivity({
      ...props,
      date: new Date(props.date),
    });

    return entity;
  }
}
