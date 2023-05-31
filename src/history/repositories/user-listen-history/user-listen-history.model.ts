import { Model, snakeCaseMappers } from "objection";

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

  static tableName = "user_listen_history";
  static get columnNameMappers() {
    return snakeCaseMappers();
  }
}
