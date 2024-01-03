import { Model, snakeCaseMappers } from "objection";

type ImageProps = {
  url: string;
  width: number;
  height: number;
};

export type SpotifyAlbumModelProps = {
  id: string;
  name: string;
  images: ImageProps[];
};

export class SpotifyAlbumModel extends Model implements SpotifyAlbumModelProps {
  id!: string;
  name!: string;
  images!: ImageProps[];

  static tableName = "spotify_album";
  static jsonAttributes = ["images"];
  static get columnNameMappers() {
    return snakeCaseMappers();
  }
}
