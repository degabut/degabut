import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, EventBus, IInferredCommandHandler } from "@nestjs/cqrs";
import { TrackSkippedEvent } from "@queue-player/events";
import { QueuePlayerRepository } from "@queue-player/repositories";

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
    if (!player) throw new NotFoundException("Player not found");
    const member = player.getMember(executor.id);
    if (!member) throw new ForbiddenException("Missing permissions");

    if (!player.currentTrack) return;
    const skippedTrack = player.currentTrack;

    await player.audioPlayer.stop();

    this.eventBus.publish(new TrackSkippedEvent({ track: skippedTrack, member }));
  }
}
