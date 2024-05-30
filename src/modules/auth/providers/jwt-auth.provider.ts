import { AuthConfigService } from "@auth/config";
import { Injectable } from "@nestjs/common";
import * as jwt from "jsonwebtoken";

@Injectable()
export class JwtAuthProvider {
  private readonly privateKey: string;
  private readonly expirationTime: string;

  constructor(configService: AuthConfigService) {
    this.privateKey = configService.jwt.secret;
    this.expirationTime = configService.jwt.expirationTime || "1y";
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
