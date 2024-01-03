import { Model, snakeCaseMappers } from "objection";

export type SpotifyTrackArtistModelProps = {
  trackId: string;
  artistId: string;
};

export class SpotifyTrackArtistModel extends Model implements SpotifyTrackArtistModelProps {
  trackId!: string;
  artistId!: string;

  static tableName = "spotify_track_artist";
  static get columnNameMappers() {
    return snakeCaseMappers();
  }
}
