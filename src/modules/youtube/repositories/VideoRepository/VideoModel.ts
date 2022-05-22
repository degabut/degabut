import { Model, RelationMappingsThunk } from "objection";
import { ChannelModel } from "../ChannelRepository/ChannelModel";

type ThumbnailProps = {
	url: string;
	width: number;
	height: number;
};

export type VideoModelProps = {
	id: string;
	title: string;
	duration: number;
	view_count: number | null;
	thumbnails: ThumbnailProps[];
	channel_id: string | null;
};

export class VideoModel extends Model implements VideoModelProps {
	id!: string;
	title!: string;
	duration!: number;
	view_count!: number | null;
	channel_id!: string | null;
	thumbnails!: ThumbnailProps[];

	channel?: ChannelModel;

	static tableName = "video";
	static jsonAttributes = ["thumbnails"];
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
