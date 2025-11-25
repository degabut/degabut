import { Model, snakeCaseMappers } from "objection";

export type LyricsModelProps = {
  mediaSourceId: string;
  source: string;
  richSynced: string | null;
  synced: string | null;
  unsynced: string | null;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
};

export class LyricsModel extends Model implements LyricsModelProps {
  mediaSourceId!: string;
  source!: string;
  richSynced!: string | null;
  synced!: string | null;
  unsynced!: string | null;
  duration!: number;
  createdAt!: Date;
  updatedAt!: Date;

  static tableName = "lyrics";
  static get columnNameMappers() {
    return snakeCaseMappers();
  }
}
