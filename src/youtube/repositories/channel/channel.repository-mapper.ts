import { YoutubeChannel, YoutubeThumbnail } from "@youtube/entities";

import { YoutubeChannelModel, YoutubeChannelModelProps } from "./channel.model";

export class YoutubeChannelRepositoryMapper {
  public static toRepository(entity: YoutubeChannel): YoutubeChannelModelProps {
    const props: YoutubeChannelModelProps = {
      id: entity.id,
      name: entity.name,
      thumbnails: entity.thumbnails,
    };

    return props;
  }

  public static toDomainEntity(model: YoutubeChannelModel): YoutubeChannel {
    const entity = new YoutubeChannel({
      id: model.id,
      name: model.name,
      thumbnails: model.thumbnails?.map((t) => new YoutubeThumbnail(t)) || [],
    });

    return entity;
  }
}
