import { ValidateParams } from "@common/decorators";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { UserLikeMediaSourceRepository } from "@user/repositories";

import {
  UnlikeMediaSourceCommand,
  UnlikeMediaSourceParamSchema,
  UnlikeMediaSourceResult,
} from "./unlike-media-source.command";

@CommandHandler(UnlikeMediaSourceCommand)
export class UnlikeMediaSourceHandler implements IInferredCommandHandler<UnlikeMediaSourceCommand> {
  constructor(private readonly repository: UserLikeMediaSourceRepository) {}

  @ValidateParams(UnlikeMediaSourceParamSchema)
  public async execute(params: UnlikeMediaSourceCommand): Promise<UnlikeMediaSourceResult> {
    const { mediaSourceId, executor } = params;
    await this.repository.delete(executor.id, mediaSourceId);
  }
}
