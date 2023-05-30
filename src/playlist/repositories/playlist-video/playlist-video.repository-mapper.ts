import { PlaylistVideo } from "@playlist/entities";
import { VideoRepositoryMapper } from "@youtube/repositories";

import { PlaylistVideoModel, PlaylistVideoModelProps } from "./playlist-video.model";

export class PlaylistVideoRepositoryMapper {
  public static toRepository(entity: PlaylistVideo): PlaylistVideoModelProps {
    return entity;
  }

  public static toDomainEntity(props: PlaylistVideoModel): PlaylistVideo {
    const entity = new PlaylistVideo({
      ...props,
      video: props.video ? VideoRepositoryMapper.toDomainEntity(props.video) : undefined,
      createdAt: new Date(props.createdAt),
    });

    return entity;
  }
}
