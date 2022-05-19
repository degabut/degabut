import { EventEmitter } from "events";

interface ConstructorProps {
	videoId: string;
	userId: string;
	playedAt: Date;
}

export class UserPlayHistory extends EventEmitter {
	public readonly videoId: string;
	public readonly userId: string;
	public readonly playedAt: Date;

	constructor(props: ConstructorProps) {
		super();

		this.videoId = props.videoId;
		this.userId = props.userId;
		this.playedAt = props.playedAt;
	}
}
