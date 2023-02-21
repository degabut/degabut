import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { QueuePlayerRepository } from "@queue-player/repositories";
import { PlayerDestroyReason, QueuePlayerService } from "@queue-player/services";

import { StopCommand, StopParamSchema } from "./stop.command";

@CommandHandler(StopCommand)
export class StopHandler implements IInferredCommandHandler<StopCommand> {
  constructor(
    private readonly playerService: QueuePlayerService,
    private readonly playerRepository: QueuePlayerRepository,
  ) {}

  @ValidateParams(StopParamSchema)
  public async execute(params: StopCommand): Promise<void> {
    const { voiceChannelId, executor } = params;

    const player = this.playerRepository.getByVoiceChannelId(voiceChannelId);
    if (!player) throw new NotFoundException("Player not found");
    const member = player.getMember(executor.id);
    if (!member) throw new ForbiddenException("Missing permissions");

    await this.playerService.destroyPlayer(voiceChannelId, PlayerDestroyReason.COMMAND);
  }
}
