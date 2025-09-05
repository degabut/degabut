import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { QueueAutoplayOptions, QueueAutoplayType } from "@queue/entities";
import { QueueRepository } from "@queue/repositories";

import {
  ChangeAutoplayOptionsCommand,
  ChangeAutoplayOptionsParamSchema,
} from "./change-autoplay-options.command";

@CommandHandler(ChangeAutoplayOptionsCommand)
export class ChangeAutoplayOptionsHandler
  implements IInferredCommandHandler<ChangeAutoplayOptionsCommand>
{
  constructor(private readonly queueRepository: QueueRepository) {}

  @ValidateParams(ChangeAutoplayOptionsParamSchema)
  public async execute(params: ChangeAutoplayOptionsCommand): Promise<QueueAutoplayOptions> {
    const {
      voiceChannelId,
      executor,
      types,
      includeQueueLastPlayedRelated,
      includeQueueRelated,
      includeUserLibrary,
      includeUserLibraryRelated,
      minDuration,
      maxDuration,
      excludedMemberIds,
      addExcludedMemberId,
      removeExcludedMemberId,
    } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");
    const member = queue.getMember(executor.id);
    if (!member) throw new ForbiddenException("Missing permissions");

    const patchOptions: Partial<QueueAutoplayOptions> = {};

    if (maxDuration !== undefined) patchOptions.maxDuration = maxDuration;
    if (minDuration !== undefined) patchOptions.minDuration = minDuration;
    if (excludedMemberIds || addExcludedMemberId || removeExcludedMemberId) {
      let excludedMemberIdsSet = new Set<string>(
        excludedMemberIds || queue.autoplayOptions.excludedMemberIds,
      );
      if (addExcludedMemberId) excludedMemberIdsSet.add(addExcludedMemberId);
      if (removeExcludedMemberId) excludedMemberIdsSet.delete(removeExcludedMemberId);
      patchOptions.excludedMemberIds = Array.from(excludedMemberIdsSet);
    }
    if (
      types ||
      includeQueueLastPlayedRelated ||
      includeQueueRelated ||
      includeUserLibrary ||
      includeUserLibraryRelated
    ) {
      const combinedType = new Set<QueueAutoplayType>(types || []);
      if (includeQueueLastPlayedRelated) combinedType.add("QUEUE_LAST_PLAYED_RELATED");
      if (includeQueueRelated) combinedType.add("QUEUE_RELATED");
      if (includeUserLibrary) {
        combinedType.add("USER_OLD_MOST_PLAYED");
        combinedType.add("USER_RECENTLY_LIKED");
        combinedType.add("USER_RECENTLY_PLAYED");
        combinedType.add("USER_RECENT_MOST_PLAYED");
      }
      if (includeUserLibraryRelated) {
        combinedType.add("USER_OLD_MOST_PLAYED_RELATED");
        combinedType.add("USER_RECENTLY_LIKED_RELATED");
        combinedType.add("USER_RECENTLY_PLAYED_RELATED");
        combinedType.add("USER_RECENT_MOST_PLAYED_RELATED");
      }
      patchOptions.types = Array.from(combinedType);
    }

    if (
      patchOptions.excludedMemberIds &&
      patchOptions.excludedMemberIds.some(
        (id) => !queue.voiceChannel.members.some((m) => m.id === id),
      )
    ) {
      throw new ForbiddenException("Excluded members must be in the voice channel");
    }

    queue.setAutoplayOptions(member, {
      ...queue.autoplayOptions,
      ...patchOptions,
    });

    return queue.autoplayOptions;
  }
}
