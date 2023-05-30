import { Thumbnail, VideoCompact } from "@youtube/entities";

import { ChannelRepositoryMapper } from "../channel/channel.repository-mapper";
import { VideoModel, VideoModelProps } from "./video.model";

export class VideoRepositoryMapper {
  public static toRepository(entity: VideoCompact): VideoModelProps {
    const props: VideoModelProps = {
      id: entity.id,
      title: entity.title,
      duration: entity.duration,
      viewCount: entity.viewCount,
      thumbnails: entity.thumbnails,
      channelId: entity.channel?.id || null,
      updatedAt: entity.updatedAt,
    };

    return props;
  }

  public static toDomainEntity(model: VideoModel): VideoCompact {
    const entity = new VideoCompact({
      ...model,
      viewCount: model.viewCount ? +model.viewCount : null,
      channel: model.channel ? ChannelRepositoryMapper.toDomainEntity(model.channel) : null,
      thumbnails: model.thumbnails.map((t) => new Thumbnail(t)),
      updatedAt: model.updatedAt,
    });

    return entity;
  }
}
