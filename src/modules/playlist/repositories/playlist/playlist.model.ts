import { Model, snakeCaseMappers } from "objection";

type ImageProps = {
  url: string;
  width: number;
  height: number;
};

export type PlaylistModelProps = {
  id: string;
  name: string;
  ownerId: string;
  images: ImageProps[] | null;
  mediaSourceCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export class PlaylistModel extends Model implements PlaylistModelProps {
  id!: string;
  name!: string;
  ownerId!: string;
  images!: ImageProps[] | null;
  mediaSourceCount!: number;
  createdAt!: Date;
  updatedAt!: Date;

  static tableName = "playlist";
  static get columnNameMappers() {
    return snakeCaseMappers();
  }
  static get jsonAttributes() {
    return ["images"];
  }
}
