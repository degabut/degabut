import { AudioResource, createAudioResource } from "@discordjs/voice";
import { injectable } from "tsyringe";
import ytdl from "ytdl-core";
import { Track } from "../entities/Track";

@injectable()
export class TrackService {
	public createAudioSource(track: Track): AudioResource<Track> {
		const stream = ytdl(track.video.id, {
			filter: "audioonly",
			highWaterMark: 1 << 62,
			liveBuffer: 1 << 62,
			dlChunkSize: 0,
			quality: "highestaudio",
		});
		const resource = createAudioResource<Track>(stream, { metadata: track });

		return resource;
	}
}
