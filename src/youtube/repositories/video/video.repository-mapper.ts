import { Thumbnail, VideoCompact } from "@youtube/entities";

import { ChannelRepositoryMapper } from "../channel/channel.repository-mapper";
import { VideoModel, VideoModelProps } from "./video.model";

export class VideoRepositoryMapper {
  public static toRepository(entity: VideoCompact): VideoModelProps {
    const props: VideoModelProps = {
      id: entity.id,
      title: entity.title,
      duration: entity.duration,
      view_count: entity.viewCount,
      thumbnails: entity.thumbnails,
      channel_id: entity.channel?.id || null,
      updated_at: entity.updatedAt,
    };

    return props;
  }

  public static toDomainEntity(model: VideoModel): VideoCompact {
    const entity = new VideoCompact({
      id: model.id,
      title: model.title,
      duration: model.duration,
      viewCount: model.view_count,
      channel: model.channel ? ChannelRepositoryMapper.toDomainEntity(model.channel) : null,
      thumbnails: model.thumbnails.map((t) => new Thumbnail(t)),
      updatedAt: model.updated_at,
    });

    return entity;
  }
}
