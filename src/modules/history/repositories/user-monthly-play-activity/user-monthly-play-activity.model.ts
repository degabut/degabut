import { Model, snakeCaseMappers } from "objection";

export type UserMonthlyPlayActivityProps = {
  userId: string;
  date: Date;
  playCount: number;
  uniquePlayCount: number;
};

export class UserMonthlyPlayActivityModel extends Model implements UserMonthlyPlayActivityProps {
  userId!: string;
  date!: Date;
  playCount!: number;
  uniquePlayCount!: number;

  static tableName = "user_monthly_play_activity";
  static idColumn = ["userId", "date"];
  static get columnNameMappers() {
    return snakeCaseMappers();
  }
}
