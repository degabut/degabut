import { IUseCaseContext, UseCase } from "@core";
import {
	GetGuildMemberAdapter,
	GetGuildMemberUseCase,
} from "@modules/discord/useCases/GetGuildMemberUseCase";
import { Track } from "@modules/queue/domain/Track";
import { OnTrackAddEvent } from "@modules/queue/events/OnTrackAddEvent";
import { OnTrackEndEvent } from "@modules/queue/events/OnTrackEndEvent";
import { IQueueRepository } from "@modules/queue/repository/IQueueRepository";
import { IYoutubeProvider } from "@modules/youtube/providers/IYoutubeProvider";
import { YoutubeProvider } from "@modules/youtube/providers/YoutubeProvider";
import { inject, injectable } from "tsyringe";
import { AddTrackParams } from "./AddTrackAdapter";

export type AddTrackResponse = Track;

@injectable()
export class AddTrackUseCase extends UseCase<AddTrackParams, AddTrackResponse> {
	public emits = [OnTrackAddEvent];

	constructor(
		@inject(YoutubeProvider) private youtubeProvider: IYoutubeProvider,
		@inject("QueueRepository") private queueRepository: IQueueRepository,
		@inject(GetGuildMemberUseCase) private getGuildMember: GetGuildMemberUseCase
	) {
		super();
	}

	public async run(params: AddTrackParams, { userId }: IUseCaseContext): Promise<AddTrackResponse> {
		const { keyword, id, guildId, textChannel, voiceChannel } = params;

		const requestedBy = await this.getGuildMember.execute(
			new GetGuildMemberAdapter({ guildId, userId })
		);
		if (!requestedBy) throw new Error("User not found");

		let queue = this.queueRepository.get(guildId);
		if (!queue) {
			if (!textChannel || !voiceChannel) throw new Error("Queue not found");
			queue = this.queueRepository.create({ guildId, voiceChannel, textChannel });
			queue.on("trackEnd", () => queue && super.emit(OnTrackEndEvent, queue));
		}

		if (!queue.voiceChannel.members.find((m) => m.id === requestedBy.id)) {
			throw new Error("User not in voice channel");
		}

		const [video] = keyword
			? await this.youtubeProvider.searchVideo(keyword)
			: [await this.youtubeProvider.getVideo(id)];
		if (!video) throw new Error("Video not found");

		const track = new Track({
			id: video.id,
			duration: "duration" in video ? video.duration || 0 : 0,
			title: video.title,
			thumbnailUrl: video.thumbnails.best,
			channel: video.channel,
			requestedBy,
		});

		queue.addTrack(track);

		return track;
	}
}
