import { IUseCaseContext, UseCase } from "@core";
import {
	GetGuildMemberAdapter,
	GetGuildMemberUseCase,
} from "@modules/discord/useCases/GetGuildMemberUseCase";
import { Queue } from "@modules/queue/domain/Queue";
import { Track } from "@modules/queue/domain/Track";
import { OnTrackAddEvent } from "@modules/queue/events/OnTrackAddEvent";
import { OnTrackEndEvent } from "@modules/queue/events/OnTrackEndEvent";
import { IQueueRepository } from "@modules/queue/repository/IQueueRepository";
import { DIYoutubeProvider, IYoutubeProvider } from "@modules/youtube/providers/IYoutubeProvider";
import { GuildMember } from "discord.js";
import { inject, injectable } from "tsyringe";
import { AddTrackParams } from "./AddTrackAdapter";

export type AddTrackResponse = Track;

@injectable()
export class AddTrackUseCase extends UseCase<AddTrackParams, AddTrackResponse> {
	public emits = [OnTrackAddEvent];

	constructor(
		@inject(DIYoutubeProvider) private youtubeProvider: IYoutubeProvider,
		@inject("QueueRepository") private queueRepository: IQueueRepository,
		@inject(GetGuildMemberUseCase) private getGuildMember: GetGuildMemberUseCase
	) {
		super();
	}

	public async run(params: AddTrackParams, { userId }: IUseCaseContext): Promise<AddTrackResponse> {
		const { keyword, id, guildId, textChannel, voiceChannel } = params;

		let queue: Queue | undefined;
		let requestedBy: GuildMember | undefined;

		if (guildId) {
			// if guildId is passed, get queue by guildId
			requestedBy = await this.getGuildMember.execute(
				new GetGuildMemberAdapter({ guildId, userId })
			);
			queue = this.queueRepository.get(guildId);

			if (!queue) {
				// create queue if doesn't exists
				if (!textChannel || !voiceChannel) throw new Error("Queue not found");
				queue = this.queueRepository.create({ guildId, voiceChannel, textChannel });
				queue.on("trackEnd", () => queue && super.emit(OnTrackEndEvent, queue));
			} else if (!requestedBy || !queue.voiceChannel.members.get(requestedBy.id)) {
				throw new Error("User not in voice channel");
			}
		} else {
			// if guildId is not passed, get queue by userId
			queue = this.queueRepository.getByUserId(userId);
			requestedBy = queue?.voiceChannel.members.get(userId);
		}

		if (!queue) throw new Error("Queue not found");
		if (!requestedBy) throw new Error("User not found");

		const [video] = keyword
			? await this.youtubeProvider.searchVideo(keyword)
			: [await this.youtubeProvider.getVideo(id)];
		if (!video) throw new Error("Video not found");

		const track = new Track({
			video,
			requestedBy,
		});

		queue.addTrack(track);

		return track;
	}
}
