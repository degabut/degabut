import { Channel } from "./Channel";

interface Props {
	id: string;
	title: string;
	duration: number;
	thumbnail: string | null;
	channel: Channel | null;
	viewCount: number | null;
}

export class VideoCompact implements Props {
	public readonly id: string;
	public readonly title: string;
	public readonly duration: number;
	public readonly thumbnail: string | null;
	public readonly channel: Channel | null;
	public readonly viewCount: number | null;

	constructor(props: Props) {
		this.id = props.id;
		this.title = props.title;
		this.duration = props.duration;
		this.thumbnail = props.thumbnail;
		this.channel = props.channel;
		this.viewCount = props.viewCount;
	}
}
