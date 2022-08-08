export * from "http";

declare module "http" {
  export interface IncomingMessage {
    userId: string;
  }
}
