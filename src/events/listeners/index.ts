import { Constructor, IEventHandler } from "@nestjs/cqrs";

import { MemberJammedHandler } from "./member-jammed.handler";
import { QueueUpdatedHandler } from "./queue-updated.handler";
import { VoiceMemberJoinedHandler } from "./voice-member-joined.handler";
import { VoiceMemberLeftHandler } from "./voice-member-left.handler";

export const Listeners: Constructor<IEventHandler>[] = [
  QueueUpdatedHandler,
  MemberJammedHandler,
  VoiceMemberJoinedHandler,
  VoiceMemberLeftHandler,
];
