import { MediaSourceModel } from "@media-source/repositories";
import { Model, RelationMappingsThunk, snakeCaseMappers } from "objection";

export type UserListenHistoryModelProps = {
  userId: string;
  mediaSourceId?: string;
  voiceChannelId: string;
  guildId: string;
  isRequester: boolean;
  listenedAt: Date;
};

export class UserListenHistoryModel extends Model implements UserListenHistoryModelProps {
  userId!: string;
  mediaSourceId!: string;
  voiceChannelId!: string;
  guildId!: string;
  isRequester!: boolean;
  listenedAt!: Date;

  mediaSource?: MediaSourceModel;

  static tableName = "user_listen_history";
  static get columnNameMappers() {
    return snakeCaseMappers();
  }
  static relationMappings: RelationMappingsThunk = () => ({
    mediaSource: {
      relation: Model.HasOneRelation,
      modelClass: MediaSourceModel,
      join: {
        from: "user_listen_history.media_source_id",
        to: "media_source.id",
      },
    },
  });
}
