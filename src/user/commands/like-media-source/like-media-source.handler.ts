import { ValidateParams } from "@common/decorators";
import { MediaSourceService } from "@media-source/services";
import { BadRequestException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { UserLikeMediaSource } from "@user/entities";
import { UserLikeMediaSourceRepository } from "@user/repositories";
import { MAX_LIKED_ITEM } from "@user/user.constant";

import {
  LikeMediaSourceCommand,
  LikeMediaSourceParamSchema,
  LikeMediaSourceResult,
} from "./like-media-source.command";

@CommandHandler(LikeMediaSourceCommand)
export class LikeMediaSourceHandler implements IInferredCommandHandler<LikeMediaSourceCommand> {
  constructor(
    private readonly repository: UserLikeMediaSourceRepository,
    private readonly mediaSourceService: MediaSourceService,
  ) {}

  @ValidateParams(LikeMediaSourceParamSchema)
  public async execute(params: LikeMediaSourceCommand): Promise<LikeMediaSourceResult> {
    const { mediaSourceId, executor } = params;

    const mediaSource = await this.mediaSourceService.getSource({ mediaSourceId });
    if (!mediaSource) throw new BadRequestException("Media source not found");

    const count = await this.repository.getCountByUserId(executor.id);
    if (count >= MAX_LIKED_ITEM) throw new BadRequestException("Max liked limit reached");

    const userLikeMediaSource = new UserLikeMediaSource({
      userId: executor.id,
      mediaSourceId: mediaSource.id,
    });

    await this.repository.insert(userLikeMediaSource);
  }
}
