import { Module } from "@nestjs/common";
import { ConfigModule, registerAs } from "@nestjs/config";
import * as Joi from "joi";

export const databaseConfig = registerAs("database", () => ({
  database: process.env.POSTGRES_DB as string,
  user: process.env.POSTGRES_USER as string,
  password: process.env.POSTGRES_PASSWORD as string,
  host: process.env.POSTGRES_HOST as string,
}));

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig],
      validationSchema: Joi.object({
        POSTGRES_DB: Joi.string().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_HOST: Joi.string().required(),
      }),
      validationOptions: {
        abortEarly: false,
      },
    }),
  ],
})
export class DatabaseConfigModule {}
