import { Channel } from "./Channel";
import { VideoCompact } from "./VideoCompact";

interface Props {
	id: string;
	title: string;
	duration: number;
	thumbnail: string | null;
	channel: Channel | null;
	viewCount: number | null;
	related: VideoCompact[];
}

export class Video implements Props {
	public readonly id: string;
	public readonly title: string;
	public readonly duration: number;
	public readonly thumbnail: string | null;
	public readonly channel: Channel | null;
	public readonly viewCount: number | null;
	public readonly related: VideoCompact[];

	constructor(props: Props) {
		this.id = props.id;
		this.title = props.title;
		this.duration = props.duration;
		this.thumbnail = props.thumbnail;
		this.channel = props.channel;
		this.viewCount = props.viewCount;
		this.related = props.related;
	}
}
