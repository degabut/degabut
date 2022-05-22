import { Thumbnail } from "@modules/youtube/entities/Thumbnail";
import { VideoCompact } from "@modules/youtube/entities/VideoCompact";
import { ChannelRepositoryMapper } from "../ChannelRepository/ChannelRepositoryMapper";
import { VideoModel, VideoModelProps } from "./VideoModel";

export class VideoRepositoryMapper {
	public static toRepository(entity: VideoCompact): VideoModelProps {
		const props: VideoModelProps = {
			id: entity.id,
			title: entity.title,
			duration: entity.duration,
			view_count: entity.viewCount,
			thumbnails: entity.thumbnails,
			channel_id: entity.channel?.id || null,
		};

		return props;
	}

	public static toDomainEntity(model: VideoModel): VideoCompact {
		const entity = new VideoCompact({
			id: model.id,
			title: model.title,
			duration: model.duration,
			viewCount: model.view_count,
			channel: model.channel ? ChannelRepositoryMapper.toDomainEntity(model.channel) : null,
			thumbnails: model.thumbnails.map((t) => new Thumbnail(t)),
		});

		return entity;
	}
}
