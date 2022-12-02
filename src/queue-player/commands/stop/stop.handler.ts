import { ValidateParams } from "@common/decorators";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { PlayerDestroyReason, QueuePlayerService } from "@queue-player/services";

import { StopCommand, StopParamSchema } from "./stop.command";

@CommandHandler(StopCommand)
export class StopHandler implements IInferredCommandHandler<StopCommand> {
  constructor(private readonly playerService: QueuePlayerService) {}

  @ValidateParams(StopParamSchema)
  public async execute(params: StopCommand): Promise<void> {
    this.playerService.destroyPlayer(params.voiceChannelId, PlayerDestroyReason.COMMAND);
  }
}
