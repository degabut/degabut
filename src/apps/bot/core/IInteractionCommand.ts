import { ButtonInteraction } from "discord.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IInteractionCommand<Meta = any> {
	name: string;
	description: string;
	enabled?: boolean;
	execute: (interaction: ButtonInteraction, meta: Meta) => Promise<unknown>;
	buttonInteractionIdParser?: (id: string) => Meta;
}
