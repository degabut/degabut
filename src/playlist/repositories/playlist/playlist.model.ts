import { Model, snakeCaseMappers } from "objection";

export type PlaylistModelProps = {
  id: string;
  name: string;
  ownerId: string;
  mediaSourceCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export class PlaylistModel extends Model implements PlaylistModelProps {
  id!: string;
  name!: string;
  ownerId!: string;
  mediaSourceCount!: number;
  createdAt!: Date;
  updatedAt!: Date;

  static tableName = "playlist";
  static get columnNameMappers() {
    return snakeCaseMappers();
  }
}
