import { UseCase } from "@core";
import { YoutubeProvider } from "@modules/youtube/providers/YoutubeProvider";
import { SearchVideoUseCase } from "@modules/youtube/useCases/SearchVideoUseCase";
import { container } from "tsyringe";
import { Client } from "youtubei";

const useCases = [SearchVideoUseCase];

export const registerYoutubeModules = (): void => {
	const client = new Client();
	const youtubeProvider = new YoutubeProvider(client);

	container.register(YoutubeProvider, { useValue: youtubeProvider });

	useCases.map((U) => container.registerSingleton<UseCase>(U));
};
