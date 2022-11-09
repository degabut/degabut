import { Inject, Injectable } from "@nestjs/common";
import { Channel } from "@youtube/entities";

import { ChannelModel } from "./channel.model";
import { ChannelRepositoryMapper } from "./channel.repository-mapper";

@Injectable()
export class ChannelRepository {
  constructor(
    @Inject(ChannelModel)
    private readonly channelModel: typeof ChannelModel,
  ) {}

  public async upsert(channel: Channel | Channel[]): Promise<void> {
    const channels = Array.isArray(channel) ? channel : [channel];

    const props = channels.map(ChannelRepositoryMapper.toRepository);
    await this.channelModel.query().insert(props).onConflict("id").merge();
  }
}
