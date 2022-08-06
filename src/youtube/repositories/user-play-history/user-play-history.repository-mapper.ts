import { UserPlayHistory } from "../../entities";
import { UserPlayHistoryModel, UserPlayHistoryModelProps } from "./user-play-history.model";

export class UserPlayHistoryRepositoryMapper {
  public static toRepository(entity: UserPlayHistory): UserPlayHistoryModelProps {
    const props: UserPlayHistoryModelProps = {
      user_id: entity.userId,
      video_id: entity.videoId,
      played_at: entity.playedAt,
    };

    return props;
  }

  public static toDomainEntity(props: UserPlayHistoryModel): UserPlayHistory {
    const entity = new UserPlayHistory({
      userId: props.user_id,
      videoId: props.video_id,
      playedAt: new Date(props.played_at),
    });

    return entity;
  }
}
