import "discord.js";
import Player from "../modules/Player";
import Queue from "../modules/Queue";

type CommandArgs = {
	name: string;
	description?: string;
};

declare module "discord.js" {
	export interface Client {
		commands: Command[];
		player: Player;
	}

	export interface Guild {
		queue?: Queue;
	}

	export interface Command<ButtonInteractionMeta = unknown> {
		name: string;
		description: string;
		aliases?: string[];
		args?: CommandArgs[];
		enabled?: boolean;
		execute: (message: Message, args: string[]) => Promise<unknown>;
		buttonInteractionIdPrefix?: string;
		buttonInteractionIdParser?: (id: string) => ButtonInteractionMeta;
		buttonInteractionIdArgs?: string[];
		buttonInteraction?: (
			interaction: ButtonInteraction,
			meta: ButtonInteractionMeta extends unknown ? unknown : ButtonInteractionMeta
		) => Promise<unknown>;
	}
}
