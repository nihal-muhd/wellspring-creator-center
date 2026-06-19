import type { AccessTokenPayload } from "../lib/auth-token";
import type { Logger } from "pino";

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
      id: string | number | object;
      log: Logger;
    }
  }
}

export {};
