import { VideoModel } from "@youtube/repositories";
import { Model, RelationMappingsThunk, snakeCaseMappers } from "objection";

export type UserListenHistoryModelProps = {
  userId: string;
  videoId: string;
  voiceChannelId: string;
  guildId: string;
  isRequester: boolean;
  listenedAt: Date;
};

export class UserListenHistoryModel extends Model implements UserListenHistoryModelProps {
  userId!: string;
  videoId!: string;
  voiceChannelId!: string;
  guildId!: string;
  isRequester!: boolean;
  listenedAt!: Date;

  video?: VideoModel;

  static tableName = "user_listen_history";
  static get columnNameMappers() {
    return snakeCaseMappers();
  }
  static relationMappings: RelationMappingsThunk = () => ({
    video: {
      relation: Model.HasOneRelation,
      modelClass: VideoModel,
      join: {
        from: "user_listen_history.video_id",
        to: "video.id",
      },
    },
  });
}
