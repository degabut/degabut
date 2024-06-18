import { MediaSourceModel } from "@media-source/repositories";
import { Model, RelationMappingsThunk, snakeCaseMappers } from "objection";

export type PlaylistMediaSourceModelProps = {
  id: string;
  playlistId: string;
  mediaSourceId: string;
  createdBy: string;
  createdAt: Date;
};

export class PlaylistMediaSourceModel extends Model implements PlaylistMediaSourceModelProps {
  id!: string;
  playlistId!: string;
  mediaSourceId!: string;
  createdBy!: string;
  createdAt!: Date;

  mediaSource!: MediaSourceModel;

  static tableName = "playlist_media_source";
  static get columnNameMappers() {
    return snakeCaseMappers();
  }
  static relationMappings: RelationMappingsThunk = () => ({
    mediaSource: {
      relation: Model.BelongsToOneRelation,
      modelClass: MediaSourceModel,
      join: {
        from: "playlist_media_source.media_source_id",
        to: "media_source.id",
      },
    },
  });
}
