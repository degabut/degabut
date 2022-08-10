import { Model } from "objection";

export type UserPlayHistoryModelProps = {
  user_id: string;
  video_id: string;
  played_at: Date;
};

export class UserPlayHistoryModel extends Model implements UserPlayHistoryModelProps {
  user_id!: string;
  video_id!: string;
  played_at!: Date;

  static tableName = "user_play_history";
}
