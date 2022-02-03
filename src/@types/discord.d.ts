import "discord.js";

type CommandArgs = {
	name: string;
	description?: string;
};

declare module "discord.js" {
	export interface Client {
		commands: Command[];
		prefix: string;
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
