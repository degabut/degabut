import { Exclude, Expose, plainToInstance } from "class-transformer";
import { MusicBaseArtist } from "youtubei";

@Exclude()
export class MusicBaseArtistDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  public static create(entity: MusicBaseArtist): MusicBaseArtistDto {
    return plainToInstance(MusicBaseArtistDto, entity);
  }
}
