import { ValidateParams } from "@common/decorators";
import { BadRequestException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { UserLikeVideo } from "@user/entities";
import { UserLikeVideoRepository } from "@user/repositories";
import { MAX_LIKED_VIDEO } from "@user/user.constant";
import { YoutubeCachedService } from "@youtube/services";

import { LikeVideoCommand, LikeVideoParamSchema, LikeVideoResult } from "./like-video.command";

@CommandHandler(LikeVideoCommand)
export class LikeVideoHandler implements IInferredCommandHandler<LikeVideoCommand> {
  constructor(
    private readonly repository: UserLikeVideoRepository,
    private readonly youtubeService: YoutubeCachedService,
  ) {}

  @ValidateParams(LikeVideoParamSchema)
  public async execute(params: LikeVideoCommand): Promise<LikeVideoResult> {
    const { videoId, executor } = params;

    const video = await this.youtubeService.getVideo(videoId);
    if (!video) throw new BadRequestException("Video not found");

    const count = await this.repository.getCountByUserId(executor.id);
    if (count >= MAX_LIKED_VIDEO) throw new BadRequestException("Max liked video reached");

    const userLikeVideo = new UserLikeVideo({
      userId: executor.id,
      videoId: video.id,
    });

    await this.repository.insert(userLikeVideo);
  }
}
