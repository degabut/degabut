import { Image } from "@common/entities";
import { YoutubeVideoCompact } from "@youtube/entities";

import { YoutubeChannelRepositoryMapper } from "../youtube-channel";
import { YoutubeVideoModel, YoutubeVideoModelProps } from "./youtube-video.model";

export class YoutubeVideoRepositoryMapper {
  public static toRepository(entity: YoutubeVideoCompact): YoutubeVideoModelProps {
    const props: YoutubeVideoModelProps = {
      id: entity.id,
      title: entity.title,
      duration: entity.duration,
      viewCount: entity.viewCount,
      thumbnails: entity.thumbnails,
      channelId: entity.channel?.id || null,
      updatedAt: entity.updatedAt,
      musicMetadata: entity.musicMetadata,
    };

    return props;
  }

  public static toDomainEntity(model: YoutubeVideoModel): YoutubeVideoCompact {
    const entity = new YoutubeVideoCompact({
      ...model,
      viewCount: model.viewCount ? +model.viewCount : null,
      channel: model.channel ? YoutubeChannelRepositoryMapper.toDomainEntity(model.channel) : null,
      thumbnails: model.thumbnails.map((t) => new Image(t)),
      updatedAt: model.updatedAt,
    });

    return entity;
  }
}
