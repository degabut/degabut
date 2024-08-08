import { Model, RelationMappingsThunk, snakeCaseMappers } from "objection";

import { SpotifyAlbumModel } from "../spotify-album";
import { SpotifyArtistModel } from "../spotify-artist";

export type SpotifyTrackModelProps = {
  id: string;
  name: string;
  durationMs: number;
  albumId: string;
  updatedAt: Date;
};

export class SpotifyTrackModel extends Model implements SpotifyTrackModelProps {
  id!: string;
  name!: string;
  durationMs!: number;
  albumId!: string;
  updatedAt!: Date;

  album!: SpotifyAlbumModel;
  artists!: SpotifyArtistModel[];

  static tableName = "spotify_track";
  static get columnNameMappers() {
    return snakeCaseMappers();
  }
  static relationMappings: RelationMappingsThunk = () => ({
    album: {
      relation: Model.HasOneRelation,
      modelClass: SpotifyAlbumModel,
      join: {
        from: "spotify_track.album_id",
        to: "spotify_album.id",
      },
    },
    artists: {
      relation: Model.ManyToManyRelation,
      modelClass: SpotifyArtistModel,
      join: {
        from: "spotify_track.id",
        through: {
          from: "spotify_track_artist.track_id",
          to: "spotify_track_artist.artist_id",
        },
        to: "spotify_artist.id",
      },
    },
  });
}
