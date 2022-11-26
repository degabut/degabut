import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, EventBus, IInferredCommandHandler } from "@nestjs/cqrs";
import { Jam, JamCollection } from "@queue/entities";
import { MemberJammedEvent } from "@queue/events/member-jammed.event";
import { QueueRepository } from "@queue/repositories";

import { JamCommand, JamParamSchema } from "./jam.command";

@CommandHandler(JamCommand)
export class JamHandler implements IInferredCommandHandler<JamCommand> {
  constructor(
    private readonly queueRepository: QueueRepository,
    private readonly eventBus: EventBus,
  ) {}

  @ValidateParams(JamParamSchema)
  public async execute(params: JamCommand): Promise<void> {
    const { voiceChannelId, count, executor } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");
    const member = queue.voiceChannel.members.find((m) => m.id === executor.id);
    if (!member) throw new ForbiddenException("Missing permissions");

    const jam = new JamCollection({
      member,
      jams: [...Array(count)].map(
        () =>
          new Jam({
            jamSpeed: Math.random(),
            xOffset: Math.random(),
            ySpeed: Math.random(),
          }),
      ),
    });

    this.eventBus.publish(new MemberJammedEvent({ jam, queue }));
  }
}
