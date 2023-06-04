import { VideoModel } from "@youtube/repositories";
import { Model, RelationMappingsThunk, snakeCaseMappers } from "objection";

export type UserPlayHistoryModelProps = {
  userId: string;
  videoId: string;
  voiceChannelId: string | null;
  guildId: string | null;
  playedAt: Date;
};

export class UserPlayHistoryModel extends Model implements UserPlayHistoryModelProps {
  userId!: string;
  videoId!: string;
  voiceChannelId!: string | null;
  guildId!: string | null;
  playedAt!: Date;

  video?: VideoModel;

  static tableName = "user_play_history";
  static get columnNameMappers() {
    return snakeCaseMappers();
  }
  static relationMappings: RelationMappingsThunk = () => ({
    video: {
      relation: Model.HasOneRelation,
      modelClass: VideoModel,
      join: {
        from: "user_play_history.video_id",
        to: "video.id",
      },
    },
  });
}
