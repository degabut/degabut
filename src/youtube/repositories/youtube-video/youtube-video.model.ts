import { Model, RelationMappingsThunk, snakeCaseMappers } from "objection";

import { YoutubeChannelModel } from "../youtube-channel";

type ThumbnailProps = {
  url: string;
  width: number;
  height: number;
};

export type YoutubeVideoModelProps = {
  id: string;
  title: string;
  duration: number;
  viewCount: number | null;
  thumbnails: ThumbnailProps[];
  channelId: string | null;
  updatedAt: Date;
};

export class YoutubeVideoModel extends Model implements YoutubeVideoModelProps {
  id!: string;
  title!: string;
  duration!: number;
  viewCount!: number | null;
  channelId!: string | null;
  thumbnails!: ThumbnailProps[];
  updatedAt!: Date;

  channel?: YoutubeChannelModel;

  static tableName = "youtube_video";
  static jsonAttributes = ["thumbnails"];
  static get columnNameMappers() {
    return snakeCaseMappers();
  }
  static relationMappings: RelationMappingsThunk = () => ({
    channel: {
      relation: Model.HasOneRelation,
      modelClass: YoutubeChannelModel,
      join: {
        from: "youtube_video.channel_id",
        to: "youtube_channel.id",
      },
    },
  });
}
