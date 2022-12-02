import { Module } from "@nestjs/common";
import { ConfigModule, registerAs } from "@nestjs/config";
import * as Joi from "joi";

export const loggerConfig = registerAs("logger", () => ({
  level: (process.env.LOG_LEVEL as string) || "info",
}));

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [loggerConfig],
      validationSchema: Joi.object({
        LOG_LEVEL: Joi.string().valid("trace", "debug", "info", "warn", "error"),
      }),
      validationOptions: {
        abortEarly: false,
      },
    }),
  ],
})
export class LoggerConfigModule {}
