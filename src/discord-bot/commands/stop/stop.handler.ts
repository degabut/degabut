import { ValidateParams } from "@common/decorators";
import { DiscordPlayerService } from "@discord-bot/services";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";

import { StopCommand, StopParamSchema } from "./stop.command";

@CommandHandler(StopCommand)
export class StopHandler implements IInferredCommandHandler<StopCommand> {
  constructor(private readonly playerService: DiscordPlayerService) {}

  @ValidateParams(StopParamSchema)
  public async execute(params: StopCommand): Promise<void> {
    this.playerService.stopPlayer(params.guildId);
  }
}
