import { Model } from "objection";

type ThumbnailProps = {
	url: string;
	width: number;
	height: number;
};

export type ChannelModelProps = {
	id: string;
	name: string;
	thumbnails: ThumbnailProps[];
};

export class ChannelModel extends Model implements ChannelModelProps {
	id!: string;
	name!: string;
	thumbnails!: ThumbnailProps[];

	static tableName = "channel";
	static jsonAttributes = ["thumbnails"];
}
