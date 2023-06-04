import { Inject, Injectable } from "@nestjs/common";

import { UserListenHistory } from "../../entities";
import { UserListenHistoryModel } from "./user-listen-history.model";
import { UserListenHistoryRepositoryMapper } from "./user-listen-history.repository-mapper";

@Injectable()
export class UserListenHistoryRepository {
  constructor(
    @Inject(UserListenHistoryModel)
    private readonly userListenHistoryModel: typeof UserListenHistoryModel,
  ) {}

  public async insert(userListenHistories: UserListenHistory[]): Promise<void> {
    const props = userListenHistories.map((h) => UserListenHistoryRepositoryMapper.toRepository(h));
    await this.userListenHistoryModel.query().insert(props).returning("*");
  }
}
