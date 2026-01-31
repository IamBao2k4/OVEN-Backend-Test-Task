import { Common } from "./common.type";

export interface Webhook extends Common {
  source: string;
  event: string;
  payload: any;
  receivedAt: Date;
}