import { BaseGuildTextChannel, BaseGuildVoiceChannel, GuildMember } from "discord.js";
import Joi from "joi";
import { inject, injectable } from "tsyringe";
import { UseCase } from "../../../core";
import { IYoutubeProvider } from "../../youtube";
import { YoutubeProvider } from "../../youtube/providers/YoutubeProvider";
import { Queue, Track } from "../domain";
import { QueueManager } from "../managers";
import { AutoAddTrackUseCase } from "./AutoAddTrackUseCase";

type Params = {
	keyword: string;
	id: string;
	guildId: string;
	requestedBy: GuildMember;
	voiceChannel?: BaseGuildVoiceChannel;
	textChannel?: BaseGuildTextChannel;
};

type Response = Queue | undefined;

@injectable()
export class AddTrackUseCase extends UseCase<Params, Response> {
	public paramsSchema = Joi.object<Params>({
		keyword: Joi.string(),
		id: Joi.string(),
		guildId: Joi.string().required(),
		requestedBy: Joi.object().instance(GuildMember).required(),
		voiceChannel: Joi.object().instance(BaseGuildVoiceChannel),
		textChannel: Joi.object().instance(BaseGuildTextChannel),
	})
		.required()
		.xor("keyword", "id");

	constructor(
		@inject(YoutubeProvider) private youtubeProvider: IYoutubeProvider,
		@inject(QueueManager) private queueManager: QueueManager,
		@inject(AutoAddTrackUseCase) private autoAddTrack: AutoAddTrackUseCase
	) {
		super();
	}

	public async run(params: Params): Promise<Response> {
		const { keyword, id, requestedBy, guildId, textChannel, voiceChannel } = params;

		let queue = this.queueManager.get(guildId);
		if (!queue) {
			if (!textChannel || !voiceChannel) throw new Error("Queue not found");
			queue = this.queueManager.create({ guildId, voiceChannel, textChannel });
			queue.on("autoplay", () => this.autoAddTrack.execute({ queue }));
		}

		const [video] = keyword
			? await this.youtubeProvider.searchVideo(keyword)
			: [await this.youtubeProvider.getVideo(id)];
		if (!video) throw new Error("Video not found");

		queue.addTrack(
			new Track({
				id: video.id,
				duration: "duration" in video ? video.duration || 0 : 0,
				title: video.title,
				thumbnailUrl: video.thumbnails.best,
				channel: video.channel,
				requestedBy,
			})
		);

		return queue;
	}
}
