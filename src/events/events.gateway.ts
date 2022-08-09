import { JwtAuthProvider } from "@auth/providers";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
} from "@nestjs/websockets";
import { v4 } from "uuid";

import { IdentifiedWebSocket } from "./interfaces";

@WebSocketGateway(8081, {
  cors: { origin: "*" },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly unidentifiedClients = new Map<string, IdentifiedWebSocket>();
  private readonly identifiedClients = new Map<string, IdentifiedWebSocket>();
  private readonly disconnectTimeout: Record<string, NodeJS.Timeout> = {};

  constructor(private readonly jwtAuthProvider: JwtAuthProvider) {}

  handleConnection(client: IdentifiedWebSocket) {
    client.id = v4();
    this.unidentifiedClients.set(client.id, client);
    this.disconnectTimeout[client.id] = setTimeout(() => client.close(), 5000);
  }

  handleDisconnect(client: IdentifiedWebSocket) {
    this.unidentifiedClients.delete(client.id);
    if (client.userId) this.identifiedClients.delete(client.userId);
  }

  send(userIds: string[], event: string, data: any) {
    if (!userIds.length) return;

    const targets: IdentifiedWebSocket[] = [];

    for (const userId of userIds) {
      const client = this.identifiedClients.get(userId);
      if (client) targets.push(client);
    }

    const payload = JSON.stringify({
      event,
      data,
    });

    targets.forEach((t) => t.send(payload));
  }

  @SubscribeMessage("identify")
  identify(
    @ConnectedSocket() client: IdentifiedWebSocket,
    @MessageBody() data: { token: string },
  ): WsResponse<{ userId: string }> | void {
    try {
      const userId = this.jwtAuthProvider.verify(data.token);
      clearTimeout(this.disconnectTimeout[client.id]);

      client.userId = userId;
      this.unidentifiedClients.delete(client.id);
      this.identifiedClients.set(userId, client);

      return {
        event: "identify",
        data: { userId },
      };
    } catch {
      client.close();
    }
  }
}
