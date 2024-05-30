import { SpotifyTrackDto } from "@spotify/dtos";
import { YoutubeVideoCompactDto } from "@youtube/dtos";
import { Exclude, Expose, plainToInstance, Type } from "class-transformer";

import { MediaSource, MediaSourceType } from "../entities";

@Exclude()
export class MediaSourceDto {
  @Expose()
  public id!: string;

  @Expose()
  public sourceId!: string;

  @Expose()
  public type!: MediaSourceType;

  @Expose()
  public url!: string;

  @Expose()
  public title!: string;

  @Expose()
  public creator!: string;

  @Expose()
  public duration!: number;

  @Expose()
  public maxThumbnailUrl!: string | null;

  @Expose()
  public minThumbnailUrl!: string | null;

  @Expose()
  public playedYoutubeVideoId!: string | null;

  @Expose()
  public youtubeVideoId!: string;

  @Expose()
  @Type(() => SpotifyTrackDto)
  public spotifyTrackId!: string;

  @Exclude()
  @Type(() => YoutubeVideoCompactDto)
  public youtubeVideo!: YoutubeVideoCompactDto;

  @Exclude()
  @Type(() => SpotifyTrackDto)
  public spotifyTrack!: SpotifyTrackDto;

  public static create(entity: MediaSource): MediaSourceDto {
    return plainToInstance(MediaSourceDto, entity);
  }
}
