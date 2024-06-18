import { Model, snakeCaseMappers } from "objection";

export type SpotifyArtistModelProps = {
  id: string;
  name: string;
};

export class SpotifyArtistModel extends Model implements SpotifyArtistModelProps {
  id!: string;
  name!: string;

  static tableName = "spotify_artist";
  static get columnNameMappers() {
    return snakeCaseMappers();
  }
}
