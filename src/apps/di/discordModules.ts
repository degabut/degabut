import { UseCase } from "@core";
import {
	DiscordOAuthProvider,
	DiscordOAuthProviderProps,
} from "@modules/discord/providers/DiscordOAuthProvider";
import { LyricProvider } from "@modules/lyric/providers/LyricProvider";
import { GetLyricUseCase } from "@modules/lyric/useCases/GetLyricUseCase";
import { container } from "tsyringe";

const useCases = [GetLyricUseCase];

export const registerDiscordModules = (oAuthProps?: DiscordOAuthProviderProps): void => {
	if (oAuthProps) {
		const discordOAuthProvider = new DiscordOAuthProvider(oAuthProps);
		container.register(DiscordOAuthProvider, { useValue: discordOAuthProvider });
	}

	container.registerSingleton(LyricProvider);

	useCases.map((U) => container.registerSingleton<UseCase>(U));
};
