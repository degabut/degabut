import { ValidateParams } from "@common/decorators";
import { TrackSeekedEvent } from "@discord-bot/events";
import { QueuePlayerRepository } from "@discord-bot/repositories";
import { ForbiddenException } from "@nestjs/common";
import { CommandHandler, EventBus, IInferredCommandHandler } from "@nestjs/cqrs";

import { SeekCommand, SeekParamSchema } from "./seek.command";

@CommandHandler(SeekCommand)
export class SeekHandler implements IInferredCommandHandler<SeekCommand> {
  constructor(
    private readonly playerRepository: QueuePlayerRepository,
    private readonly eventBus: EventBus,
  ) {}

  @ValidateParams(SeekParamSchema)
  public async execute(params: SeekCommand): Promise<void> {
    const { voiceChannelId, executor } = params;

    const player = this.playerRepository.getByVoiceChannelId(voiceChannelId);
    if (!player) throw new Error("Player not found");
    const member = player.getMember(executor.id);
    if (!member) throw new ForbiddenException("Missing permissions");

    if (!player.currentTrack?.track) return;

    await player.audioPlayer.seek(params.seek);

    this.eventBus.publish(new TrackSeekedEvent({ player, member, seek: params.seek }));
  }
}
