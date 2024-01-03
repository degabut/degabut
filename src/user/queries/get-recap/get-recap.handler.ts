import { ValidateParams } from "@common/decorators";
import { UserListenHistoryRepository, UserPlayHistoryRepository } from "@history/repositories";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";

import { GetRecapParamSchema, GetRecapQuery, GetRecapResult } from "./get-recap.query";

@QueryHandler(GetRecapQuery)
export class GetRecapHandler implements IInferredQueryHandler<GetRecapQuery> {
  constructor(
    private readonly playRepository: UserPlayHistoryRepository,
    private readonly listenRepository: UserListenHistoryRepository,
  ) {}

  @ValidateParams(GetRecapParamSchema)
  public async execute(params: GetRecapQuery): Promise<GetRecapResult> {
    const { executor, year } = params;

    const [other, mostPlayed, monthly] = await Promise.all([
      this.getOther(executor.id, year),
      this.getMostPlayed(executor.id, year),
      this.getMonthly(executor.id, year),
    ]);

    return {
      mostPlayed,
      monthly,
      ...other,
    };
  }

  private async getMostPlayed(userId: string, year: number) {
    const mostPlayed = await this.playRepository.getMostPlayedByUserId(userId, {
      ...this.getFromTo(year),
      includeContent: true,
      count: 5,
    });

    return mostPlayed;
  }

  private async getMonthly(userId: string, year: number) {
    const months = [...Array(12).keys()];

    const result = months.map(async (month) => {
      const range = this.getFromTo(year, month);

      const [mostPlayed, play] = await Promise.all([
        this.playRepository.getMostPlayedByUserId(userId, {
          ...range,
          includeContent: true,
          count: 1,
        }),
        this.playRepository.getDurationAndCount(userId, range),
      ]);

      return {
        month,
        songPlayed: play.count,
        durationPlayed: play.duration,
        mostPlayed: mostPlayed.at(0) ?? null,
      };
    });

    return await Promise.all(result);
  }

  private async getOther(userId: string, year: number) {
    const range = this.getFromTo(year);

    const [play, playUniqueCount] = await Promise.all([
      this.playRepository.getDurationAndCount(userId, range),
      this.playRepository.getUniqueCount(userId, range),
    ]);

    return {
      songPlayed: play.count,
      durationPlayed: play.duration,
      uniqueSongPlayed: playUniqueCount,
    };
  }

  private getFromTo(year: number, month?: number) {
    const from = month !== undefined ? new Date(year, month, 1) : new Date(year, 0, 1);
    const to = month !== undefined ? new Date(year, month + 1, 0) : new Date(year, 11, 31);
    return { from, to };
  }
}
