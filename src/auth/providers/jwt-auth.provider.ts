import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as jwt from "jsonwebtoken";

@Injectable()
export class JwtAuthProvider {
  private readonly privateKey: string;
  private readonly expirationTime: string;

  constructor(configService: ConfigService) {
    const config = configService.getOrThrow<any>("jwt");
    this.privateKey = config.privateKey;
    this.expirationTime = config.expirationTime;
  }

  public sign(userId: string): string {
    return jwt.sign({}, this.privateKey, {
      audience: userId,
      expiresIn: this.expirationTime,
    });
  }

  public verify(token: string): string {
    const { aud } = jwt.verify(token, this.privateKey) as jwt.JwtPayload;
    return aud as string;
  }
}
