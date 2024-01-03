import { Inject, Injectable } from "@nestjs/common";
import { YoutubeChannel } from "@youtube/entities";

import { YoutubeChannelModel } from "./youtube-channel.model";
import { YoutubeChannelRepositoryMapper } from "./youtube-channel.repository-mapper";

@Injectable()
export class YoutubeChannelRepository {
  constructor(
    @Inject(YoutubeChannelModel)
    private readonly channelModel: typeof YoutubeChannelModel,
  ) {}

  public async upsert(channel: YoutubeChannel | YoutubeChannel[]): Promise<void> {
    const channels = Array.isArray(channel) ? channel : [channel];

    const props = channels.map(YoutubeChannelRepositoryMapper.toRepository);
    await this.channelModel.query().insert(props).onConflict("id").merge();
  }
}
