import { UserPlayHistoryRepository } from "@modules/user/repositories/UserPlayHistoryRepository";
import { container } from "tsyringe";

const repositories = [UserPlayHistoryRepository];

export const registerUserModules = (): void => {
	repositories.map((R) => container.registerSingleton(R));
};
