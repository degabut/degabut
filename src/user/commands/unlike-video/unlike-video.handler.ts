import { ValidateParams } from "@common/decorators";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { UserLikeVideoRepository } from "@user/repositories";

import {
  UnlikeVideoCommand,
  UnlikeVideoParamSchema,
  UnlikeVideoResult,
} from "./unlike-video.command";

@CommandHandler(UnlikeVideoCommand)
export class UnlikeVideoHandler implements IInferredCommandHandler<UnlikeVideoCommand> {
  constructor(private readonly repository: UserLikeVideoRepository) {}

  @ValidateParams(UnlikeVideoParamSchema)
  public async execute(params: UnlikeVideoCommand): Promise<UnlikeVideoResult> {
    const { videoId, executor } = params;
    await this.repository.delete(executor.id, videoId);
  }
}
