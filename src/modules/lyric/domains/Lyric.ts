interface Props {
	author: string;
	title: string;
	content: string;
	sourceUrl: string;
}

export class Lyric {
	author: string;
	title: string;
	content: string;
	sourceUrl: string;

	constructor(props: Props) {
		this.author = props.author;
		this.title = props.title;
		this.content = props.content;
		this.sourceUrl = props.sourceUrl;
	}
}
