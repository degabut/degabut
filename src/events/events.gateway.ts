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
  private readonly clients = new Map<string, IdentifiedWebSocket>();
  private readonly disconnectTimeout: Record<string, NodeJS.Timeout> = {};

  constructor(private readonly jwtAuthProvider: JwtAuthProvider) {}

  handleConnection(client: IdentifiedWebSocket) {
    client.id = v4();
    this.clients.set(client.id, client);
    this.disconnectTimeout[client.id] = setTimeout(() => client.close(), 5000);
  }

  handleDisconnect(client: IdentifiedWebSocket) {
    this.clients.delete(client.id);
  }

  send(userIds: string[], event: string, data: any) {
    const clients = [...this.clients.values()];
    const targets = clients.filter((c) => c.userId && userIds.includes(c.userId));

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
      client.userId = userId;
      clearTimeout(this.disconnectTimeout[client.id]);

      return {
        event: "identify",
        data: { userId },
      };
    } catch {
      client.close();
    }
  }
}
