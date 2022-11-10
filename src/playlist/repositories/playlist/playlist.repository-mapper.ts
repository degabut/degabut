import { Playlist } from "@playlist/entities";

import { PlaylistModel, PlaylistModelProps } from "./playlist.model";

export class PlaylistRepositoryMapper {
  public static toRepository(entity: Playlist): PlaylistModelProps {
    const props: PlaylistModelProps = {
      id: entity.id,
      name: entity.name,
      owner_id: entity.ownerId,
      video_count: entity.videoCount,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
    };

    return props;
  }

  public static toDomainEntity(props: PlaylistModel): Playlist {
    const entity = new Playlist({
      id: props.id,
      name: props.name,
      ownerId: props.owner_id,
      videoCount: props.video_count,
      createdAt: new Date(props.created_at),
      updatedAt: new Date(props.updated_at),
    });

    return entity;
  }
}
