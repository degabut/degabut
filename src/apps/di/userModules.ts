import { UserPlayHistoryRepository } from "@modules/user/repository/UserPlayHistoryRepository";
import { container } from "tsyringe";

const repositories = [UserPlayHistoryRepository];

export const registerUserModules = (): void => {
	repositories.map((R) => container.registerSingleton(R));
};
