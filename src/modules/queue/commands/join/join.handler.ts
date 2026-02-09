import { ValidateParams } from "@common/decorators";
import { DiscordService } from "@discord/services";
import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { Member } from "@queue/entities";
import { QueueRepository } from "@queue/repositories";

import { JoinCommand, JoinParamSchema } from "./join.command";

@CommandHandler(JoinCommand)
export class JoinHandler implements IInferredCommandHandler<JoinCommand> {
  constructor(
    private readonly queueRepository: QueueRepository,
    private readonly discordService: DiscordService,
  ) {}

  @ValidateParams(JoinParamSchema)
  public async execute(params: JoinCommand): Promise<void> {
    const queue = this.queueRepository.getByVoiceChannelId(params.voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found.");

    const userId = params.executor.id;

    const member = await this.discordService.getMemberWithPermissionIn(
      userId,
      params.voiceChannelId,
    );

    if (!member) throw new UnauthorizedException("No permission to connect to the voice channel.");

    queue.addMember(Member.fromDiscordGuildMember(member, false, true));
  }
}
