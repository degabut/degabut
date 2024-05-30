import { Exclude, Expose, plainToInstance } from "class-transformer";

import { SpotifyImage } from "../entities";

@Exclude()
export class SpotifyImageDto {
  @Expose()
  url!: string;

  @Expose()
  width!: number;

  @Expose()
  height!: number;

  public static create(entity: SpotifyImage): SpotifyImageDto {
    return plainToInstance(SpotifyImageDto, entity);
  }
}
