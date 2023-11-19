import { Module } from "@nestjs/common";
import { ConfigModule, registerAs } from "@nestjs/config";
import * as Joi from "joi";

export const jwtAuthConfig = registerAs("jwt", () => ({
  privateKey: process.env.JWT_PRIVATE_KEY as string,
  expirationTime: process.env.JWT_EXPIRATION_TIME as string,
}));

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [jwtAuthConfig],
      validationSchema: Joi.object({
        JWT_PRIVATE_KEY: Joi.string().required(),
        JWT_EXPIRATION_TIME: Joi.string().optional().default("1y"),
      }),
      validationOptions: {
        abortEarly: false,
      },
    }),
  ],
})
export class JwtAuthConfigModule {}
