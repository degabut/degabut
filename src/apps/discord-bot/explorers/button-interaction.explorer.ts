import { Logger } from "@logger/logger.service";
import { Injectable } from "@nestjs/common";
import { DiscoveryService } from "@nestjs/core";
import { InstanceWrapper } from "@nestjs/core/injector/instance-wrapper";
import { Client } from "discord.js";

import { BUTTON_INTERACTION, ButtonInteractionOptions } from "../decorators";
import { IButtonInteraction } from "../interfaces";

type Decorated<T> = {
  instanceWrapper: InstanceWrapper<T>;
  options: ButtonInteractionOptions;
};

@Injectable()
export class ButtonInteractionExplorer {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly discordClient: Client,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(ButtonInteractionExplorer.name);
  }

  onModuleInit() {
    const providers = this.discoveryService.getProviders();
    const prefixCommands = this.getInteractions(providers);

    this.registerInteractions(prefixCommands);
  }

  private getInteractions(providers: InstanceWrapper[]): Decorated<IButtonInteraction>[] {
    const prefixCommands = providers.reduce((val, i) => {
      if (!i.instance || typeof i.instance !== "object") return val;
      const options = Reflect.getMetadata(BUTTON_INTERACTION, i.instance);
      if (!options) return val;

      val.push({ instanceWrapper: i, options });
      return val;
    }, [] as Decorated<IButtonInteraction>[]);

    return prefixCommands;
  }

  private registerInteractions(commands: Decorated<IButtonInteraction>[]) {
    this.discordClient.on("interactionCreate", async (interaction) => {
      if (!interaction.isButton() || interaction.user.bot || !interaction.guild) return;

      const [name, ...path] = interaction.customId.split("/");

      const command = commands.find((command) => command.options.name === name);
      if (!command) return;

      const pathSchema = command.options.key.split("/");
      const params = pathSchema.reduce<Record<string, string>>((val, key, index) => {
        if (key.startsWith(":")) {
          val[key.substring(1)] = path[index - 1];
        }
        return val;
      }, {});

      try {
        const reply = await command.instanceWrapper.instance.handler(interaction, params);
        if (reply) interaction.reply(reply);
      } catch (error) {
        await interaction.reply(`Failed to execute the command: ${(error as Error).message}`);
      }
    });

    for (const command of commands) {
      this.logger.info(`Registered {${command.options.name}} interaction handler`);
    }
  }
}
