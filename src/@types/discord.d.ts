import "discord.js";
import { Queue } from "../modules";

type CommandArgs = {
	name: string;
	description?: string;
};

declare module "discord.js" {
	export interface Client {
		commands: Command[];
		prefix: string;
	}

	export interface Message {
		queue?: Queue;
	}

	export interface Interaction {
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
			meta: ButtonInteractionMeta
		) => Promise<unknown>;
	}
}
