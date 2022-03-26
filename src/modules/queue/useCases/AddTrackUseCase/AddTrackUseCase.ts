import { IUseCaseContext, UseCase } from "@core";
import { GetGuildMemberUseCase } from "@modules/discord";
import { IQueueRepository, OnTrackAddEvent, OnTrackEndEvent, Track } from "@modules/queue";
import { IYoutubeProvider, YoutubeProvider } from "@modules/youtube";
import { BaseGuildTextChannel, BaseGuildVoiceChannel } from "discord.js";
import Joi from "joi";
import { inject, injectable } from "tsyringe";

export type AddTrackParams = {
	keyword: string;
	id: string;
	guildId: string;
	voiceChannel?: BaseGuildVoiceChannel;
	textChannel?: BaseGuildTextChannel;
};

export type AddTrackResponse = Track;

@injectable()
export class AddTrackUseCase extends UseCase<AddTrackParams, AddTrackResponse> {
	public paramsSchema = Joi.object<AddTrackParams>({
		keyword: Joi.string(),
		id: Joi.string(),
		guildId: Joi.string().required(),
		voiceChannel: Joi.object().instance(BaseGuildVoiceChannel),
		textChannel: Joi.object().instance(BaseGuildTextChannel),
	})
		.required()
		.xor("keyword", "id");

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

		const requestedBy = await this.getGuildMember.execute({ guildId, userId });
		if (!requestedBy) throw new Error("User not found");

		let queue = this.queueRepository.get(guildId);
		if (!queue) {
			if (!textChannel || !voiceChannel) throw new Error("Queue not found");
			queue = this.queueRepository.create({ guildId, voiceChannel, textChannel });
			queue.on("autoplay", () => queue && super.emit(OnTrackEndEvent, queue));
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
