import { UseCase } from "@core";
import { DIYoutubeProvider } from "@modules/youtube/providers/IYoutubeProvider";
import { YoutubeiYoutubeProvider } from "@modules/youtube/providers/Youtubei/YoutubeiYoutubeProvider";
import { SearchVideoUseCase } from "@modules/youtube/useCases/SearchVideoUseCase";
import { container } from "tsyringe";
import { Client } from "youtubei";

const useCases = [SearchVideoUseCase];

export const registerYoutubeModules = (): void => {
	const client = new Client();
	const youtubeProvider = new YoutubeiYoutubeProvider(client);

	container.register(DIYoutubeProvider, { useValue: youtubeProvider });

	useCases.map((U) => container.registerSingleton<UseCase>(U));
};
