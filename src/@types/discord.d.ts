import "discord.js";
import { Queue } from "../modules";

type CommandArgs = {
	name: string;
	description?: string;
};

declare module "discord.js" {
	export interface Client {
		commands: Command[];
		interactions: InteractionCommand[];
		prefix: string;
	}

	export type Middleware = (message: Message | Interaction) => Promise<void>;

	export type CommandGeneric = {
		hasQueue?: boolean;
	};

	export interface Command<T extends CommandGeneric = any> {
		name: string;
		description: string;
		aliases?: string[];
		args?: CommandArgs[];
		enabled?: boolean;
		middlewares?: Middleware | Middleware[];
		execute: (
			message: Message,
			args: string[],
			queue: T["hasQueue"] extends true ? Queue : Queue | undefined
		) => Promise<unknown>;
	}

	export type InteractionCommandGeneric = {
		hasQueue?: boolean;
		buttonInteractionMeta: any;
	};

	export interface InteractionCommand<T extends InteractionCommandGeneric = any> {
		name: string;
		description: string;
		enabled?: boolean;
		middlewares?: Middleware | Middleware[];
		execute: (
			interaction: ButtonInteraction,
			meta: T["buttonInteractionMeta"],
			queue: T["hasQueue"] extends true ? Queue : Queue | undefined
		) => Promise<unknown>;
		buttonInteractionIdParser?: (id: string) => T["buttonInteractionMeta"];
	}
}
