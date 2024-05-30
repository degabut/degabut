import { Exclude, Expose, plainToInstance, Type } from "class-transformer";
import { Playlist, PlaylistVideos } from "youtubei";

import { ChannelDto } from "./channel.dto";
import { ThumbnailDto } from "./thumbnail.dto";
import { VideoCompactDto } from "./video-compact.dto";

@Exclude()
export class PlaylistVideosDto {
  @Expose()
  @Type(() => VideoCompactDto)
  items!: VideoCompactDto[];

  @Expose()
  continuation!: string | null;

  public static create(entity: PlaylistVideos): PlaylistVideosDto {
    return plainToInstance(PlaylistVideosDto, {
      items: entity.items,
      continuation: entity.continuation || null,
    });
  }
}

@Exclude()
export class PlaylistDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  videoCount!: number;

  @Expose()
  viewCount!: number;

  @Expose()
  @Type(() => ThumbnailDto)
  thumbnails!: ThumbnailDto[];

  @Expose()
  @Type(() => ChannelDto)
  channel!: ChannelDto;

  @Expose()
  @Type(() => PlaylistVideosDto)
  videos!: PlaylistVideosDto;

  public static create(entity: Playlist): PlaylistDto {
    return plainToInstance(PlaylistDto, {
      ...entity,
      videos: {
        items: entity.videos.items,
        continuation: entity.videos.continuation,
      },
    });
  }
}
