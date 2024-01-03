import { Model, snakeCaseMappers } from "objection";

type ThumbnailProps = {
  url: string;
  width: number;
  height: number;
};

export type YoutubeChannelModelProps = {
  id: string;
  name: string;
  thumbnails?: ThumbnailProps[];
};

export class YoutubeChannelModel extends Model implements YoutubeChannelModelProps {
  id!: string;
  name!: string;
  thumbnails?: ThumbnailProps[];

  static tableName = "youtube_channel";
  static jsonAttributes = ["thumbnails"];
  static get columnNameMappers() {
    return snakeCaseMappers();
  }
}
