import { UseCase } from "@core";
import { LyricProvider } from "@modules/lyric/providers/LyricProvider";
import { GetLyricUseCase } from "@modules/lyric/useCases/GetLyricUseCase";
import { container } from "tsyringe";

const useCases = [GetLyricUseCase];

export const registerLyricModules = (): void => {
	container.registerSingleton(LyricProvider);

	useCases.map((U) => container.registerSingleton<UseCase>(U));
};
