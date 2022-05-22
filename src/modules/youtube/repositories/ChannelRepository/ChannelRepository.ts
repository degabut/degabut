import { Channel } from "@modules/youtube/entities/Channel";
import { injectable } from "tsyringe";
import { ChannelModel } from "./ChannelModel";
import { ChannelRepositoryMapper } from "./ChannelRepositoryMapper";

@injectable()
export class ChannelRepository {
	public async upsert(video: Channel): Promise<void> {
		const props = ChannelRepositoryMapper.toRepository(video);
		await ChannelModel.query().insert(props).onConflict("id").merge();
	}
}
