import { ImageDto } from "@common/dtos";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { SpotifyTrackDto } from "@spotify/dtos";
import { YoutubeVideoCompactDto } from "@youtube/dtos";
import { Exclude, Expose, Type, plainToInstance } from "class-transformer";

import { MediaSource, MediaSourceType } from "../entities";

@Exclude()
export class MediaSourceDto {
  @Expose()
  @ApiProperty()
  public id!: string;

  @Expose()
  @ApiProperty()
  public sourceId!: string;

  @Expose()
  @ApiProperty({ enum: MediaSourceType })
  public type!: MediaSourceType;

  @Expose()
  @ApiProperty()
  public url!: string;

  @Expose()
  @ApiProperty()
  public title!: string;

  @Expose()
  @ApiProperty()
  public creator!: string;

  @Expose()
  @ApiProperty()
  public duration!: number;

  @Expose()
  @Type(() => ImageDto)
  @ApiProperty({ type: [ImageDto] })
  public images!: ImageDto[];

  @Expose()
  @ApiProperty({ type: String, nullable: true })
  public maxThumbnailUrl!: string | null;

  @Expose()
  @ApiProperty({ type: String, nullable: true })
  public minThumbnailUrl!: string | null;

  @Expose()
  @ApiProperty({ type: String, nullable: true })
  public playedYoutubeVideoId!: string | null;

  @Expose()
  @ApiPropertyOptional()
  public youtubeVideoId?: string;

  @Expose()
  @ApiPropertyOptional()
  public spotifyTrackId?: string;

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
