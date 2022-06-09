import { BadRequestError, ForbiddenError, IUseCaseContext, NotFoundError, UseCase } from "@core";
import { Track } from "@modules/queue/entities/Track";
import { QueueRepository } from "@modules/queue/repositories/QueueRepository";
import { QueueService } from "@modules/queue/services/QueueService";
import { inject, injectable } from "tsyringe";
import { PlayTrackParams } from "./PlayTrackAdapter";

type Response = Track;

@injectable()
export class PlayTrackUseCase extends UseCase<PlayTrackParams, Response> {
	constructor(
		@inject(QueueRepository)
		private queueRepository: QueueRepository,

		@inject(QueueService)
		private queueService: QueueService
	) {
		super();
	}

	public async run(params: PlayTrackParams, { userId }: IUseCaseContext): Promise<Response> {
		const { guildId, index, trackId } = params;

		const queue = guildId
			? this.queueRepository.get(guildId)
			: this.queueRepository.getByUserId(userId);
		if (!queue) throw new NotFoundError("Queue not found");
		if (!queue.hasMember(userId)) throw new ForbiddenError("User not in voice channel");

		const track = index ? queue.tracks[index] : queue.tracks.find((t) => t.id === trackId);
		if (!track) throw new NotFoundError("Track not found");
		if (track.id === queue.nowPlaying?.id) throw new BadRequestError("Track is currently playing");

		queue.nextTrack = track;
		this.queueService.skipTrack(queue);

		return track;
	}
}
