import { Model, snakeCaseMappers } from "objection";

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

  static tableName = "user_play_history";
  static get columnNameMappers() {
    return snakeCaseMappers();
  }
}
