export class CommonUtils {
	static secondToTime(seconds: number): string {
		return new Date(seconds * 1000).toISOString().substring(11, 19).replace("-", ":");
	}

	static extractYoutubeVideoId(url: string): string {
		const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
		const match = url.match(regExp);
		return match && match[2].length === 11 ? match[2] : "";
	}
}
