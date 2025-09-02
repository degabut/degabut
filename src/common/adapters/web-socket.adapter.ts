import { INestApplicationContext } from "@nestjs/common";
import { WsAdapter } from "@nestjs/platform-ws";

export class WebSocketAdapter extends WsAdapter {
  constructor(
    app: INestApplicationContext,
    private port: number,
    private path?: string,
  ) {
    super(app);
  }

  create(
    port: number,
    options?:
      | (Record<string, any> & {
          namespace?: string | undefined;
          server?: any;
          path?: string | undefined;
        })
      | undefined,
  ) {
    port = this.port;
    const server = super.create(port, { path: this.path, ...options });
    return server;
  }
}
