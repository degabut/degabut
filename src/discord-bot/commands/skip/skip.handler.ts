import { ValidateParams } from "@common/decorators";
import { TrackSkippedEvent } from "@discord-bot/events";
import { QueuePlayerRepository } from "@discord-bot/repositories";
import { ForbiddenException } from "@nestjs/common";
import { CommandHandler, EventBus, IInferredCommandHandler } from "@nestjs/cqrs";

import { SkipCommand, SkipParamSchema } from "./skip.command";

@CommandHandler(SkipCommand)
export class SkipHandler implements IInferredCommandHandler<SkipCommand> {
  constructor(
    private readonly playerRepository: QueuePlayerRepository,
    private readonly eventBus: EventBus,
  ) {}

  @ValidateParams(SkipParamSchema)
  public async execute(params: SkipCommand): Promise<void> {
    const { voiceChannelId, executor } = params;

    const player = this.playerRepository.getByVoiceChannelId(voiceChannelId);
    if (!player) throw new Error("Player not found");
    const member = player.getMember(executor.id);
    if (!member) throw new ForbiddenException("Missing permissions");

    if (!player.currentTrack?.track) return;

    await player.audioPlayer.stop();

    this.eventBus.publish(new TrackSkippedEvent({ track: player.currentTrack.track, member }));
  }
}
