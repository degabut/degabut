interface Props {
	id: string;
	name: string;
	thumbnail: string | null;
}

export class Channel implements Props {
	public readonly id: string;
	public readonly name: string;
	public readonly thumbnail: string | null;

	constructor(props: Props) {
		this.id = props.id;
		this.name = props.name;
		this.thumbnail = props.thumbnail;
	}
}
