import { Provider } from "@nestjs/common";

import { ClearAllDiscordCommand } from "./clear-all.command";
import { ClearDiscordCommand } from "./clear.command";
import { HelpDiscordCommand } from "./help.command";
import { JoinDiscordCommand } from "./join.command";
import { LoopQueueDiscordCommand } from "./loop-queue.command";
import { LoopDiscordCommand } from "./loop.command";
import { NowPlayingDiscordCommand } from "./now-playing.command";
import { OrderDiscordCommand } from "./order.command";
import { PauseDiscordCommand } from "./pause.command";
import { PlayDiscordCommand } from "./play.command";
import { QueueDiscordCommand } from "./queue.command";
import { RecommendationDiscordCommand } from "./recommendation.command";
import { RedirectDiscordCommand } from "./redirect.command";
import { RelatedDiscordCommand } from "./related.command";
import { RemoveDiscordCommand } from "./remove.command";
import { SearchDiscordCommand } from "./search.command";
import { ShuffleDiscordCommand } from "./shuffle.command";
import { SkipDiscordCommand } from "./skip.command";
import { StopDiscordCommand } from "./stop.command";
import { UnpauseDiscordCommand } from "./unpause.command";

export const DiscordCommands: Provider[] = [
  PlayDiscordCommand,
  ClearAllDiscordCommand,
  ClearDiscordCommand,
  JoinDiscordCommand,
  LoopQueueDiscordCommand,
  LoopDiscordCommand,
  NowPlayingDiscordCommand,
  OrderDiscordCommand,
  PauseDiscordCommand,
  QueueDiscordCommand,
  RecommendationDiscordCommand,
  RelatedDiscordCommand,
  RemoveDiscordCommand,
  SearchDiscordCommand,
  ShuffleDiscordCommand,
  SkipDiscordCommand,
  StopDiscordCommand,
  UnpauseDiscordCommand,
  RedirectDiscordCommand,
  HelpDiscordCommand,
];
