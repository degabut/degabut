import { ValidateParams } from "@common/decorators";
import { TrackAudioSkippedEvent } from "@discord-bot/events";
import { QueuePlayerRepository } from "@discord-bot/repositories";
import { AudioPlayerStatus } from "@discordjs/voice";
import { CommandHandler, EventBus, IInferredCommandHandler } from "@nestjs/cqrs";
import { Track } from "@queue/entities";

import { SkipCommand, SkipParamSchema } from "./skip.command";

@CommandHandler(SkipCommand)
export class SkipHandler implements IInferredCommandHandler<SkipCommand> {
  constructor(
    private readonly playerRepository: QueuePlayerRepository,
    private readonly eventBus: EventBus,
  ) {}

  @ValidateParams(SkipParamSchema)
  public async execute(params: SkipCommand): Promise<void> {
    const { voiceChannelId, member } = params;

    const player = this.playerRepository.getByVoiceChannelId(voiceChannelId);

    if (!player || player.audioPlayer.state.status !== AudioPlayerStatus.Playing) return;

    const track = player.audioPlayer.state.resource.metadata as Track;
    player.audioPlayer.stop();
    this.eventBus.publish(new TrackAudioSkippedEvent({ track, skippedBy: member }));
  }
}
