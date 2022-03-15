import { Interaction } from "discord.js";
import { queues } from "../shared";

export const onInteract = async (interaction: Interaction): Promise<void> => {
	if (!interaction.isButton()) return;
	const client = interaction.client;

	const commands = [...client.commands.values()];
	const customId = interaction.customId;
	const prefixId = customId.split("/").shift();

	const command = commands.find((command) => command.buttonInteractionIdPrefix === prefixId);
	if (!command?.buttonInteraction) return;

	const queue = queues.get(interaction.guild?.id || "");

	try {
		if (command.middlewares) {
			const middlewares = Array.isArray(command.middlewares)
				? command.middlewares
				: [command.middlewares];

			for (const middleware of middlewares) await middleware(interaction);
		}

		const meta = command.buttonInteractionIdParser?.(customId) || {};
		await command.buttonInteraction(interaction, meta, queue);
	} catch (error) {
		await interaction.channel?.send(`Failed to execute the command: ${(error as Error).message}`);
	}
};
