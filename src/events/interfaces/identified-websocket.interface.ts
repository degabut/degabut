export interface IdentifiedWebSocket extends WebSocket {
  id: string;
  userId?: string;
}
