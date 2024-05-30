import { ILavalinkConfig } from "@common/config";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export type QueuePlayerConfigProp = {
  lavalink?: ILavalinkConfig;
};

@Injectable()
export class QueuePlayerConfigService {
  constructor(private configService: ConfigService) {}

  get lavalink() {
    return this.configService.get<ILavalinkConfig>("lavalink");
  }
}
