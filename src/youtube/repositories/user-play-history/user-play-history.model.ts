import { VideoModel } from "@youtube/repositories";
import { Model, RelationMappingsThunk } from "objection";

export type UserPlayHistoryModelProps = {
  user_id: string;
  video_id: string;
  played_at: Date;
};

export class UserPlayHistoryModel extends Model implements UserPlayHistoryModelProps {
  user_id!: string;
  video_id!: string;
  played_at!: Date;

  video?: VideoModel;

  static tableName = "user_play_history";
  static relationMappings: RelationMappingsThunk = () => ({
    video: {
      relation: Model.BelongsToOneRelation,
      modelClass: VideoModel,
      join: {
        from: "user_play_history.video_id",
        to: "video.id",
      },
    },
  });
}
