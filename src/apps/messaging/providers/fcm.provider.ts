import { Logger } from "@logger/logger.service";
import { Injectable } from "@nestjs/common";
import { App, applicationDefault, initializeApp } from "firebase-admin/app";
import { getMessaging, Messaging } from "firebase-admin/messaging";

@Injectable()
export class FcmProvider {
  private readonly app: App;
  private readonly messaging: Messaging;

  constructor(private readonly logger: Logger) {
    this.logger.setContext(FcmProvider.name);

    this.app = initializeApp({
      credential: applicationDefault(),
    });

    this.messaging = getMessaging(this.app);
  }

  async send(tokens: string[], event: string, data: any, context?: any) {
    if (!tokens.length || !event) return;

    await this.messaging.sendEachForMulticast({
      data: {
        data: JSON.stringify({
          event,
          data,
          context,
        }),
      },
      tokens,
    });
  }
}
