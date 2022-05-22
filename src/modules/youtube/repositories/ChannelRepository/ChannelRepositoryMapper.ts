import { Channel } from "@modules/youtube/entities/Channel";
import { Thumbnail } from "@modules/youtube/entities/Thumbnail";
import { ChannelModel, ChannelModelProps } from "./ChannelModel";

export class ChannelRepositoryMapper {
	public static toRepository(entity: Channel): ChannelModelProps {
		const props: ChannelModelProps = {
			id: entity.id,
			name: entity.name,
			thumbnails: entity.thumbnails,
		};

		return props;
	}

	public static toDomainEntity(model: ChannelModel): Channel {
		const entity = new Channel({
			id: model.id,
			name: model.name,
			thumbnails: model.thumbnails.map((t) => new Thumbnail(t)),
		});

		return entity;
	}
}
