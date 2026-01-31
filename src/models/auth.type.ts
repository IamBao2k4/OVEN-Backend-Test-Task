import { Common } from "./common.type";

export interface User extends Common {
  username: string;
  passwordHash: string;
}