import { MediaSourceModel } from "@media-source/repositories";
import { Model, RelationMappingsThunk, snakeCaseMappers } from "objection";

export type UserPlayHistoryModelProps = {
  userId: string;
  mediaSourceId: string;
  voiceChannelId: string | null;
  guildId: string | null;
  playedAt: Date;
};

export class UserPlayHistoryModel extends Model implements UserPlayHistoryModelProps {
  userId!: string;
  mediaSourceId!: string;
  voiceChannelId!: string | null;
  guildId!: string | null;
  playedAt!: Date;

  mediaSource?: MediaSourceModel;

  static tableName = "user_play_history";
  static get columnNameMappers() {
    return snakeCaseMappers();
  }
  static relationMappings: RelationMappingsThunk = () => ({
    mediaSource: {
      relation: Model.HasOneRelation,
      modelClass: MediaSourceModel,
      join: {
        from: "user_play_history.media_source_id",
        to: "media_source.id",
      },
    },
  });
}
