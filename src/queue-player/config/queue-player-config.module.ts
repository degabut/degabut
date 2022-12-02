import { Module } from "@nestjs/common";
import { ConfigModule, registerAs } from "@nestjs/config";
import * as Joi from "joi";

export const queuePlayerConfig = registerAs("queue-player", () => ({
  lavalinkHost: process.env.LAVA_HOST as string,
  lavalinkPassword: process.env.LAVA_PASSWORD as string,
  lavalinkPort: +(process.env.LAVA_PORT as string),
}));

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [queuePlayerConfig],
      validationSchema: Joi.object({
        LAVA_HOST: Joi.string().required(),
        LAVA_PASSWORD: Joi.string().required(),
        LAVA_PORT: Joi.string(),
      }),
      validationOptions: {
        abortEarly: false,
      },
    }),
  ],
})
export class QueuePlayerConfigModule {}
