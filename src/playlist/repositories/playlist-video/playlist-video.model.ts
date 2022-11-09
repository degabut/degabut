import { VideoModel } from "@youtube/repositories";
import { Model, RelationMappingsThunk } from "objection";

export type PlaylistVideoModelProps = {
  id: string;
  playlist_id: string;
  video_id: string;
  created_by: string;
  created_at: Date;
};

export class PlaylistVideoModel extends Model implements PlaylistVideoModelProps {
  id!: string;
  playlist_id!: string;
  video_id!: string;
  created_by!: string;
  created_at!: Date;

  video!: VideoModel;

  static tableName = "playlist_video";
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
