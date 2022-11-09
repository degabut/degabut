import { PlaylistVideo } from "@playlist/entities";
import { VideoRepositoryMapper } from "@youtube/repositories";

import { PlaylistVideoModel, PlaylistVideoModelProps } from "./playlist-video.model";

export class PlaylistVideoRepositoryMapper {
  public static toRepository(entity: PlaylistVideo): PlaylistVideoModelProps {
    const props: PlaylistVideoModelProps = {
      id: entity.id,
      playlist_id: entity.playlistId,
      video_id: entity.videoId,
      created_at: entity.createdAt,
      created_by: entity.createdBy,
    };

    return props;
  }

  public static toDomainEntity(props: PlaylistVideoModel): PlaylistVideo {
    const entity = new PlaylistVideo({
      id: props.id,
      playlistId: props.playlist_id,
      videoId: props.video_id,
      video: props.video ? VideoRepositoryMapper.toDomainEntity(props.video) : undefined,
      createdBy: props.created_by,
      createdAt: new Date(props.created_at),
    });

    return entity;
  }
}
