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

  public async upsert(channel: YoutubeChannel | YoutubeChannel[], newOnly = false): Promise<void> {
    const channels = Array.isArray(channel) ? channel : [channel];

    const props = channels.map(YoutubeChannelRepositoryMapper.toRepository);
    const model = new YoutubeChannelModel();
    const dbProps = props.map((p) => model.$formatDatabaseJson(p));

    // use knexQuery instead of objection because objection randomly throws error when parsing JSON for some reason
    if (newOnly) await this.channelModel.knexQuery().insert(dbProps).onConflict("id").ignore();
    else await this.channelModel.knexQuery().insert(dbProps).onConflict("id").merge();
  }
}
