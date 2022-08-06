import { ClearAllPrefixCommand } from "./clear-all.command";
import { ClearPrefixCommand } from "./clear.command";
import { JoinPrefixCommand } from "./join.command";
import { LoopQueuePrefixCommand } from "./loop-queue.command";
import { LoopPrefixCommand } from "./loop.command";
import { LyricPrefixCommand } from "./lyric.command";
import { NowPlayingPrefixCommand } from "./now-playing.command";
import { OrderPrefixCommand } from "./order.command";
import { PausePrefixCommand } from "./pause.command";
import { PlayPrefixCommand } from "./play.command";
import { QueuePrefixCommand } from "./queue.command";
import { RecommendationPrefixCommand } from "./recommendation.command";
import { RelatedPrefixCommand } from "./related.command";
import { RemovePrefixCommand } from "./remove.command";
import { SearchPrefixCommand } from "./search.command";
import { ShufflePrefixCommand } from "./shuffle.command";
import { SkipPrefixCommand } from "./skip.command";
import { StopPrefixCommand } from "./stop.command";
import { TogetherPrefixCommand } from "./together.command";
import { UnpausePrefixCommand } from "./unpause.command";

export * from "./clear-all.command";
export * from "./clear.command";
export * from "./index";
export * from "./join.command";
export * from "./loop-queue.command";
export * from "./loop.command";
export * from "./lyric.command";
export * from "./now-playing.command";
export * from "./order.command";
export * from "./pause.command";
export * from "./play.command";
export * from "./queue.command";
export * from "./recommendation.command";
export * from "./related.command";
export * from "./remove.command";
export * from "./search.command";
export * from "./shuffle.command";
export * from "./skip.command";
export * from "./stop.command";
export * from "./together.command";
export * from "./unpause.command";

export const Commands = [
  PlayPrefixCommand,
  ClearAllPrefixCommand,
  ClearPrefixCommand,
  JoinPrefixCommand,
  LoopQueuePrefixCommand,
  LoopPrefixCommand,
  LyricPrefixCommand,
  NowPlayingPrefixCommand,
  OrderPrefixCommand,
  PausePrefixCommand,
  QueuePrefixCommand,
  RecommendationPrefixCommand,
  RelatedPrefixCommand,
  RemovePrefixCommand,
  SearchPrefixCommand,
  ShufflePrefixCommand,
  SkipPrefixCommand,
  StopPrefixCommand,
  TogetherPrefixCommand,
  UnpausePrefixCommand,
];
