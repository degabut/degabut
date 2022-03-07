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

	interaction.queue = queues.get(interaction.guild?.id || "");

	try {
		const meta = command.buttonInteractionIdParser?.(customId) || {};
		await command.buttonInteraction(interaction, meta);
	} catch (error) {
		await interaction.channel?.send(`Failed to execute the command: ${(error as Error).message}`);
	}
};
