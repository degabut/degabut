import { Inject, Injectable } from "@nestjs/common";

import { UserPlayHistory } from "../../entities";
import { UserPlayHistoryModel } from "./user-play-history.model";
import { UserPlayHistoryRepositoryMapper } from "./user-play-history.repository-mapper";

@Injectable()
export class UserPlayHistoryRepository {
  constructor(
    @Inject(UserPlayHistoryModel)
    private readonly userPlayHistoryModel: typeof UserPlayHistoryModel,
  ) {}

  public async insert(userPlayHistory: UserPlayHistory): Promise<void> {
    const props = UserPlayHistoryRepositoryMapper.toRepository(userPlayHistory);
    await this.userPlayHistoryModel.query().insert(props).returning("*");
  }
}
