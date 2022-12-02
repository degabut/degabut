import { Module } from "@nestjs/common";
import { ConfigModule, registerAs } from "@nestjs/config";
import * as Joi from "joi";

export const discordBotConfig = registerAs("discord-bot", () => ({
  token: process.env.TOKEN as string,
  prefix: process.env.PREFIX as string,
}));

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [discordBotConfig],
      validationSchema: Joi.object({
        TOKEN: Joi.string().required(),
        PREFIX: Joi.string().required(),
      }),
      validationOptions: {
        abortEarly: false,
      },
    }),
  ],
})
export class DiscordBotConfigModule {}
