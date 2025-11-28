import { Lyrics } from "@lyrics/entities";
import { Inject, Injectable } from "@nestjs/common";

import { LyricsModel } from "./lyrics.model";
import { LyricsRepositoryMapper } from "./lyrics.repository-mapper";

@Injectable()
export class LyricsRepository {
  constructor(
    @Inject(LyricsModel)
    private readonly lyricsModel: typeof LyricsModel,
  ) {}

  public async findByMediaSourceIdAndSource(
    mediaSourceId: string,
    source: string,
  ): Promise<Lyrics | undefined> {
    const result = await this.lyricsModel
      .query()
      .where("media_source_id", mediaSourceId)
      .andWhere("source", source)
      .first();

    return result ? LyricsRepositoryMapper.toDomainEntity(result) : undefined;
  }

  public async upsert(lyrics: Lyrics): Promise<Lyrics> {
    const model = LyricsRepositoryMapper.toRepository(lyrics);
    const result = await this.lyricsModel
      .query()
      .insert(model)
      .onConflict(["media_source_id", "source"])
      .merge({
        duration: model.duration,
        richSynced: model.richSynced,
        synced: model.synced,
        unsynced: model.unsynced,
        updatedAt: new Date(),
      })
      .returning("*");

    return LyricsRepositoryMapper.toDomainEntity(result);
  }
}
