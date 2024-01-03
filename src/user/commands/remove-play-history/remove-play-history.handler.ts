import { ValidateParams } from "@common/decorators";
import { UserPlayHistoryRepository } from "@history/repositories";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";

import {
  RemovePlayHistoryCommand,
  RemovePlayHistoryParamSchema,
  RemovePlayHistoryResult,
} from "./remove-play-history.command";

@CommandHandler(RemovePlayHistoryCommand)
export class RemovePlayHistoryHandler implements IInferredCommandHandler<RemovePlayHistoryCommand> {
  constructor(private readonly repository: UserPlayHistoryRepository) {}

  @ValidateParams(RemovePlayHistoryParamSchema)
  public async execute(params: RemovePlayHistoryCommand): Promise<RemovePlayHistoryResult> {
    const { mediaSourceId, executor } = params;
    await this.repository.removeUserPlayHistory(executor.id, mediaSourceId);
  }
}
