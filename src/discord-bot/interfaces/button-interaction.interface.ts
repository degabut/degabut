import { Interaction, MessagePayload } from "discord.js";

export type ButtonInteractionResult = string | MessagePayload | void;

export interface IButtonInteraction<Params = Record<string, string>> {
  handler(
    interaction: Interaction,
    args: Params,
  ): Promise<ButtonInteractionResult | Promise<ButtonInteractionResult>>;
}
