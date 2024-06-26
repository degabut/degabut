import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, EventBus, IInferredCommandHandler } from "@nestjs/cqrs";
import { PlayerPauseStateChangedEvent } from "@queue-player/events";
import { QueuePlayerRepository } from "@queue-player/repositories";

import { SetPauseCommand, SetPauseParamSchema, SetPauseResult } from "./set-pause.command";

@CommandHandler(SetPauseCommand)
export class SetPauseHandler implements IInferredCommandHandler<SetPauseCommand> {
  constructor(
    private readonly playerRepository: QueuePlayerRepository,
    private readonly eventBus: EventBus,
  ) {}

  @ValidateParams(SetPauseParamSchema)
  public async execute(params: SetPauseCommand): Promise<SetPauseResult> {
    const { voiceChannelId, isPaused, executor } = params;

    const player = this.playerRepository.getByVoiceChannelId(voiceChannelId);
    if (!player) throw new NotFoundException("Player not found");
    const member = player.getMember(executor.id);
    if (!member) throw new ForbiddenException("Missing permissions");

    if (isPaused) await player.audioPlayer.pause();
    else await player.audioPlayer.resume();

    this.eventBus.publish(new PlayerPauseStateChangedEvent({ player, member }));

    return player.audioPlayer.isPaused;
  }
}
