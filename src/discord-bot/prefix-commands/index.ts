import { ClearAllPrefixCommand } from "./clear-all.prefix-command";
import { ClearPrefixCommand } from "./clear.prefix-command";
import { JoinPrefixCommand } from "./join.prefix-command";
import { LoopQueuePrefixCommand } from "./loop-queue.prefix-command";
import { LoopPrefixCommand } from "./loop.prefix-command";
import { LyricPrefixCommand } from "./lyric.prefix-command";
import { NowPlayingPrefixCommand } from "./now-playing.prefix-command";
import { OrderPrefixCommand } from "./order.prefix-command";
import { PausePrefixCommand } from "./pause.prefix-command";
import { PlayPrefixCommand } from "./play.prefix-command";
import { QueuePrefixCommand } from "./queue.prefix-command";
import { RecommendationPrefixCommand } from "./recommendation.prefix-command";
import { RelatedPrefixCommand } from "./related.prefix-command";
import { RemovePrefixCommand } from "./remove.prefix-command";
import { SearchPrefixCommand } from "./search.prefix-command";
import { ShufflePrefixCommand } from "./shuffle.prefix-command";
import { SkipPrefixCommand } from "./skip.prefix-command";
import { StopPrefixCommand } from "./stop.prefix-command";
import { TogetherPrefixCommand } from "./together.prefix-command";
import { UnpausePrefixCommand } from "./unpause.prefix-command";

export * from "./clear-all.prefix-command";
export * from "./clear.prefix-command";
export * from "./index";
export * from "./join.prefix-command";
export * from "./loop-queue.prefix-command";
export * from "./loop.prefix-command";
export * from "./lyric.prefix-command";
export * from "./now-playing.prefix-command";
export * from "./order.prefix-command";
export * from "./pause.prefix-command";
export * from "./play.prefix-command";
export * from "./queue.prefix-command";
export * from "./recommendation.prefix-command";
export * from "./related.prefix-command";
export * from "./remove.prefix-command";
export * from "./search.prefix-command";
export * from "./shuffle.prefix-command";
export * from "./skip.prefix-command";
export * from "./stop.prefix-command";
export * from "./together.prefix-command";
export * from "./unpause.prefix-command";

export const PrefixCommands = [
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
