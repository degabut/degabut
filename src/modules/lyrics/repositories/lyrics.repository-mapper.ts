import { Lyrics } from "@lyrics/entities";

import { LyricsModel, LyricsModelProps } from "./lyrics.model";

export class LyricsRepositoryMapper {
  public static toRepository(entity: Partial<Lyrics>): Partial<LyricsModelProps> {
    return {
      mediaSourceId: entity.mediaSourceId,
      source: entity.source,
      richSynced: entity.richSynced,
      synced: entity.synced,
      unsynced: entity.unsynced,
      createdAt: entity.createdAt || new Date(),
      updatedAt: entity.updatedAt || new Date(),
    };
  }

  public static toDomainEntity(model: LyricsModel): Lyrics {
    return new Lyrics({
      mediaSourceId: model.mediaSourceId,
      source: model.source,
      richSynced: model.richSynced,
      synced: model.synced,
      unsynced: model.unsynced,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }
}
