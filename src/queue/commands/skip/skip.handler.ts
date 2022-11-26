import { ValidateParams } from "@common/decorators";
import { ForbiddenException } from "@nestjs/common";
import { CommandHandler, EventBus, IInferredCommandHandler } from "@nestjs/cqrs";
import { TrackSkippedEvent } from "@queue/events";
import { QueueRepository } from "@queue/repositories";

import { SkipCommand, SkipParamSchema } from "./skip.command";

@CommandHandler(SkipCommand)
export class SkipHandler implements IInferredCommandHandler<SkipCommand> {
  constructor(
    private readonly queueRepository: QueueRepository,
    private readonly eventBus: EventBus,
  ) {}

  @ValidateParams(SkipParamSchema)
  public async execute(params: SkipCommand): Promise<void> {
    const { voiceChannelId, executor } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new Error("Queue not found");
    const member = queue.getMember(executor.id);
    if (!member) throw new ForbiddenException("Missing permissions");

    const track = queue.nowPlaying;
    if (!track) return;

    this.eventBus.publish(new TrackSkippedEvent({ track, member }));
  }
}
