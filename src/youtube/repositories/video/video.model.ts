import { Model, RelationMappingsThunk, snakeCaseMappers } from "objection";

import { ChannelModel } from "../channel/channel.model";

type ThumbnailProps = {
  url: string;
  width: number;
  height: number;
};

export type VideoModelProps = {
  id: string;
  title: string;
  duration: number;
  viewCount: number | null;
  thumbnails: ThumbnailProps[];
  channelId: string | null;
  updatedAt: Date;
};

export class VideoModel extends Model implements VideoModelProps {
  id!: string;
  title!: string;
  duration!: number;
  viewCount!: number | null;
  channelId!: string | null;
  thumbnails!: ThumbnailProps[];
  updatedAt!: Date;

  channel?: ChannelModel;

  static tableName = "video";
  static jsonAttributes = ["thumbnails"];
  static get columnNameMappers() {
    return snakeCaseMappers();
  }
  static relationMappings: RelationMappingsThunk = () => ({
    channel: {
      relation: Model.HasOneRelation,
      modelClass: ChannelModel,
      join: {
        from: "video.channel_id",
        to: "channel.id",
      },
    },
  });
}
