import { UserPlayHistoryRepository } from "@modules/user/repositories/UserPlayHistoryRepository/UserPlayHistoryRepository";
import { container } from "tsyringe";

const repositories = [UserPlayHistoryRepository];

export const registerUserModules = (): void => {
	repositories.map((R) => container.registerSingleton<unknown>(R));
};
