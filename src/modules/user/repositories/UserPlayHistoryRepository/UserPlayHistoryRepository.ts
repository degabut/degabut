import { UserPlayHistory } from "@modules/user/entities/UserPlayHistory";
import { injectable } from "tsyringe";
import { UserPlayHistoryModel } from "./UserPlayHistoryModel";
import { UserPlayHistoryRepositoryMapper } from "./UserPlayHistoryRepositoryMapper";

@injectable()
export class UserPlayHistoryRepository {
	public async insert(userPlayHistory: UserPlayHistory): Promise<void> {
		const props = UserPlayHistoryRepositoryMapper.toRepository(userPlayHistory);
		await UserPlayHistoryModel.query().insert(props).returning("*");
	}
}
