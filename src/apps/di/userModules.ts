import { UseCase } from "@core";
import { UserPlayHistoryRepository } from "@modules/user/repositories/UserPlayHistoryRepository/UserPlayHistoryRepository";
import { GetLastPlayedUseCase } from "@modules/user/useCases/GetLastPlayedUseCase";
import { GetMostPlayedUseCase } from "@modules/user/useCases/GetMostPlayedUseCase";
import { container } from "tsyringe";

const repositories = [UserPlayHistoryRepository];

const useCases = [GetLastPlayedUseCase, GetMostPlayedUseCase];

export const registerUserModules = (): void => {
	repositories.map((R) => container.registerSingleton<unknown>(R));
	useCases.map((U) => container.registerSingleton<UseCase>(U));
};
