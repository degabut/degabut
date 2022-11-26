import { Constructor, IEventHandler } from "@nestjs/cqrs";

import { MemberJammedHandler } from "./member-jammed.handler";
import { MemberHandler } from "./member.handler";
import { PartialQueueHandler } from "./partial-queue.handler";
import { QueueHandler } from "./queue.handler";
import { TrackMemberHandler } from "./track-member.handler";
import { TrackOrderChangedHandler } from "./track-order-changed.handler";
import { TrackHandler } from "./track.handler";
import { TracksMemberHandler } from "./tracks-member.handler";
import { VoiceMemberJoinedHandler } from "./voice-member-joined.handler";
import { VoiceMemberLeftHandler } from "./voice-member-left.handler";

export const Listeners: Constructor<IEventHandler>[] = [
  MemberJammedHandler,
  MemberHandler,
  PartialQueueHandler,
  QueueHandler,
  TrackMemberHandler,
  TrackOrderChangedHandler,
  TrackHandler,
  TracksMemberHandler,
  VoiceMemberJoinedHandler,
  VoiceMemberLeftHandler,
];
