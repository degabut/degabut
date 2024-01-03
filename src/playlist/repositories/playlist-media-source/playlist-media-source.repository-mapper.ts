import { MediaSourceRepositoryMapper } from "@media-source/repositories";
import { PlaylistMediaSource } from "@playlist/entities";

import {
  PlaylistMediaSourceModel,
  PlaylistMediaSourceModelProps,
} from "./playlist-media-source.model";

export class PlaylistMediaSourceRepositoryMapper {
  public static toRepository(entity: PlaylistMediaSource): PlaylistMediaSourceModelProps {
    return entity;
  }

  public static toDomainEntity(props: PlaylistMediaSourceModel): PlaylistMediaSource {
    const entity = new PlaylistMediaSource({
      ...props,
      mediaSource: props.mediaSource
        ? MediaSourceRepositoryMapper.toDomainEntity(props.mediaSource)
        : undefined,
      createdAt: new Date(props.createdAt),
    });

    return entity;
  }
}
