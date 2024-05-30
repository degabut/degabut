import { Playlist } from "@playlist/entities";

import { PlaylistModel, PlaylistModelProps } from "./playlist.model";

export class PlaylistRepositoryMapper {
  public static toRepository(entity: Playlist): PlaylistModelProps {
    return entity;
  }

  public static toDomainEntity(props: PlaylistModel): Playlist {
    const entity = new Playlist({
      ...props,
      createdAt: new Date(props.createdAt),
      updatedAt: new Date(props.updatedAt),
    });

    return entity;
  }
}
