import { InjectDiscordClient } from "@discord-nestjs/core";
import { Injectable, Logger } from "@nestjs/common";
import { DiscoveryService } from "@nestjs/core";
import { InstanceWrapper } from "@nestjs/core/injector/instance-wrapper";
import { Client } from "discord.js";

import { ButtonInteractionOptions, BUTTON_INTERACTION } from "../decorators";
import { IButtonInteraction } from "../interfaces";

type Decorated<T> = {
  instanceWrapper: InstanceWrapper<T>;
  options: ButtonInteractionOptions;
};

@Injectable()
export class ButtonInteractionExplorer {
  private readonly logger = new Logger(ButtonInteractionExplorer.name);

  constructor(
    private readonly discoveryService: DiscoveryService,

    @InjectDiscordClient()
    private readonly discordClient: Client,
  ) {}

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
      const params = pathSchema.reduce((val, key, index) => {
        if (key.startsWith(":")) {
          val[key.slice(1)] = path[index];
        }
        return val;
      }, {} as Record<string, string>);

      try {
        const reply = await command.instanceWrapper.instance.handler(interaction, params);
        if (reply) interaction.channel?.send(reply);
      } catch (error) {
        await interaction.channel?.send(
          `Failed to execute the command: ${(error as Error).message}`,
        );
      }
    });

    for (const command of commands) {
      this.logger.log(`Registered interaction: ${command.options.name}`);
    }
  }
}
