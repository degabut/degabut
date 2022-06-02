import { UseCase } from "@core";
import { GetGuildMemberUseCase } from "@modules/discord/useCases/GetGuildMemberUseCase";
import { OnTrackEndEvent } from "@modules/queue/events/OnTrackEndEvent";
import { OnTrackStartEvent } from "@modules/queue/events/OnTrackStartEvent";
import { QueueRepository } from "@modules/queue/repositories/QueueRepository";
import { QueueService } from "@modules/queue/services/QueueService";
import { DIYoutubeProvider, IYoutubeProvider } from "@modules/youtube/providers/IYoutubeProvider";
import { inject, injectable } from "tsyringe";
import { JoinParams } from "./JoinAdapter";

export type JoinResponse = null;

@injectable()
export class JoinUseCase extends UseCase<JoinParams, JoinResponse> {
	constructor(
		@inject(DIYoutubeProvider) private youtubeProvider: IYoutubeProvider,
		@inject(QueueRepository) private queueRepository: QueueRepository,
		@inject(QueueService) private queueService: QueueService,
		@inject(GetGuildMemberUseCase) private getGuildMember: GetGuildMemberUseCase
	) {
		super();
	}

	public async run(params: JoinParams): Promise<JoinResponse> {
		const { textChannel, voiceChannel } = params;

		let queue = this.queueRepository.get(textChannel.guild.id);
		if (queue) throw new Error("Already in a Voice Channel");

		if (textChannel.guildId !== voiceChannel.guildId) {
			throw new Error("Voice channel and text channel are not in the same guild");
		}

		queue = await this.queueService.createQueue({
			guildId: voiceChannel.guildId,
			voiceChannel,
			textChannel,
		});
		queue.on("trackEnd", () => queue && this.emit(OnTrackEndEvent, { queue }));
		queue.on("trackStart", () => queue && this.emit(OnTrackStartEvent, { queue }));

		return null;
	}
}
