import { Playlist } from "@playlist/entities";
import { Exclude, Expose, plainToInstance, Transform } from "class-transformer";

@Exclude()
export class PlaylistDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  ownerId!: number;

  @Expose()
  mediaSourceCount!: number;

  @Expose()
  @Transform(({ value }) => value?.toISOString() || null)
  createdAt!: string;

  @Expose()
  @Transform(({ value }) => value?.toISOString() || null)
  updatedAt!: string;

  public static create(entity: Playlist): PlaylistDto {
    return plainToInstance(PlaylistDto, entity);
  }
}
