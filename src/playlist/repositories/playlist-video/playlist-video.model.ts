import { VideoModel } from "@youtube/repositories";
import { Model, RelationMappingsThunk, snakeCaseMappers } from "objection";

export type PlaylistVideoModelProps = {
  id: string;
  playlistId: string;
  videoId: string;
  createdBy: string;
  createdAt: Date;
};

export class PlaylistVideoModel extends Model implements PlaylistVideoModelProps {
  id!: string;
  playlistId!: string;
  videoId!: string;
  createdBy!: string;
  createdAt!: Date;

  video!: VideoModel;

  static tableName = "playlist_video";
  static get columnNameMappers() {
    return snakeCaseMappers();
  }
  static relationMappings: RelationMappingsThunk = () => ({
    video: {
      relation: Model.BelongsToOneRelation,
      modelClass: VideoModel,
      join: {
        from: "playlist_video.video_id",
        to: "video.id",
      },
    },
  });
}
