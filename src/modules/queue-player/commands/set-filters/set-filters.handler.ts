import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, EventBus, IInferredCommandHandler } from "@nestjs/cqrs";
import { PlayerFiltersChangedEvent } from "@queue-player/events";
import { QueuePlayerRepository } from "@queue-player/repositories";

import { SetFiltersCommand, SetFiltersParamSchema, SetFiltersResult } from "./set-filters.command";

@CommandHandler(SetFiltersCommand)
export class SetFiltersHandler implements IInferredCommandHandler<SetFiltersCommand> {
  constructor(
    private readonly playerRepository: QueuePlayerRepository,
    private readonly eventBus: EventBus,
  ) {}

  @ValidateParams(SetFiltersParamSchema)
  public async execute(params: SetFiltersCommand): Promise<SetFiltersResult> {
    const { voiceChannelId, filters, executor } = params;

    const player = this.playerRepository.getByVoiceChannelId(voiceChannelId);
    if (!player) throw new NotFoundException("Player not found");
    const member = player.getMember(executor.id);
    if (!member) throw new ForbiddenException("Missing permissions");

    if (filters) {
      await player.audioPlayer.applyFilters(filters);
      this.eventBus.publish(new PlayerFiltersChangedEvent({ player, member }));
    }

    return filters;
  }
}
